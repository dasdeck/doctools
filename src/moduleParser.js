/* eslint-env node*/

const _ = require('lodash');
const jsdoc = require('jsdoc-api');

const getTypesRaw = arr => arr ? arr.join(' | ') : '';
// const getTypes = arr => arr ? arr.join(' &#124; ').replace(/\*/, '&#42;') : '';
const getTypes = getTypesRaw;

module.exports = {

    analyzeModule(source) {
        this.source = source;
        const entries = jsdoc.explainSync({source});
        return this.map(entries);//this.map(entries);
    },

    mapParams(el) {

        const tables = el.tables = {};

        const basicArgs = el.params.filter(param => !~param.name.indexOf('.'));

        const options = {0: []};
        el.params.filter(param => ~param.name.indexOf('.'))
        .forEach(param => {
            const [option, key] = param.name.split('.');
            options[option] = options[option] || [];
            param.name = key;
            options[option].push(param);
        });

        basicArgs.forEach(param => {
            options[0].push(param);
        });

        el.signature = `${el.longname || el.name} (${
            basicArgs.map(param => {
                let pString = param.name;//

                pString += `: ${getTypesRaw(param.type.names)}`;

                if (param.optional) {
                    pString = `[${pString}]`;
                }

                return pString;
            }).join(', ')

        })`;

        Object.keys(options).forEach(name => {

            const cols = ['name', 'type', 'default', 'description'].reduce((prev, curr, index) => {prev[index] = curr; return prev;}, {});

            const rows = [];

            options[name].forEach((param, index) => {
                const row = {
                    0: param.name,
                    1: getTypes(param.type.names),
                    2: param.defaultvalue,
                    3: param.description
                };

                row.optional = param.optional;
                rows.push(row);
            });

            const emptyCols = [];
            _.forEach(cols, (name, index) => {
                if (!rows.some(row => row[index])) {
                    emptyCols.push(index);
                }
            });

            const table = [cols, ...rows];

            emptyCols.forEach(index => {
                table.forEach(row => {
                    row.splice ? row.splice(index, 1) : delete row[index];
                });
            });

            tables[name == 0 ? 'arguments' : name] = table;

        });

        return el;

    },

    guessDefaultParamValues(el) {

          //extract default values
          const regex = RegExp(/name\((.*?)\)\s*{/.source.replace('name', el.name));
          const res = regex.exec(this.source);
          if (!res && !el.see) {
              debugger //why
          } else if (res) {
              const args = res[1].split(',').map(v => v.trim());

              args.forEach(arg => {
                  const [name, value] = arg.trim().split('=').map(v => v.trim());
                  if (value) {
                      const param = _.find(el.params, ['name', name]);
                      if(_.isUndefined(param.defaultvalue)) {
                          // debugger;
                          param.defaultvalue = value;
                          param.optional = true;
                      }
                  }
              });

              const more = regex.exec(this.source);
              if (more && more.index !== res.index) {
                  throw 'could not find unique method definition for: ' + el.longname + ' in: ' + this.source;
              }
          }

    },

    analyseFunction(el) {

        this.guessDefaultParamValues(el);

        if (el.params) {

            Object.assign(el, this.mapParams(el));


        } else {

            //empty default signature
            el.signature = `${el.longname}()`;
        }

        //add first return statement to signature
        if (el.returns && el.returns[0]) {
            el.signature += ` : ${getTypesRaw(el.returns[0].type.names)}`;
        }

        return el;
    },

    map(all) {

        const desc = {all, documented: []};

        all.forEach(el => {

            if (el.kind === 'file') {

                desc.description = el.description;
                if (el.type) {
                    desc.type = el.type.names[0];
                } else if(el.ignore) {
                    desc.ignore = true;
                }

            } else if (el.kind === 'function' && !el.undocumented) {

                this.analyseFunction(el);

            }

            if (!el.undocumented) {

                el.examples && el.examples.forEach(example => {
                    const marked = require('marked');
                    marked(example, {highlight(code) {
                        //TODO collect example
                    }});
                });
                if (el.kind === 'function' && el.see) {
                    const orig = _.find(desc[el.kind], func => func.name === el.see[0]);
                    // debugger
                    // _.assign(el, orig);
                    el.reference = orig.longname;
                    // markDown.push(`## ${el.longname || el.name}`);
                    // el.description && markDown.push(el.description);
                    // markDown.push(`see: <a href="#${el.see}">${el.see}</a>`);
                }

                desc[el.kind] = desc[el.kind] || [];
                desc[el.kind].push(el);
                desc.documented.push(el);
            }
        });

        return desc;
    }
};