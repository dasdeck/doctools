/* eslint-env node */
const _ = require('lodash');
const minimatch = require('minimatch');
const path = require('path');
const fs = require('fs');
const getTypesRaw = arr => arr ? arr.join(' | ') : '';

class AndMatch {
    constructor(...args) {
        this.and = args;
    }

}

function isCyclic (obj) {
    var seenObjects = [];

    function detect (obj) {
      if (obj && typeof obj === 'object') {
        if (seenObjects.indexOf(obj) !== -1) {
          return true;
        }
        seenObjects.push(obj);
        for (var key in obj) {
          if (obj.hasOwnProperty(key) && detect(obj[key])) {
            console.log(obj, 'cycle at ' + key);
            // debugger;
            return true;
          }
        }
      }
      return false;
    }

    return detect(obj);
  }

function match(conf, file, desc, recursive = true) {
    conf = _.isArray(conf) ? conf : [conf];

    return conf.some(matcher => {

        if (matcher instanceof AndMatch || matcher.and) {
            for (let i = 0 ; i < matcher.and.length; i++) {
                const subMatcher = matcher.and[i];
                if (!match(subMatcher, file, desc, recursive)) {
                    return false;
                }
            }
            return true;

        } else if (matcher instanceof RegExp) {
            return matcher.exec(file);
        } else if (typeof matcher === 'function') {
            return matcher(file, desc);
        } else if (typeof matcher === 'string') {
            matcher = desc && !path.isAbsolute(matcher) && path.join(desc.config.base, matcher) || matcher;
            return minimatch(file, matcher) || recursive && matcher.includes(file);
        } else if (_.isPlainObject(matcher)) {

            const isDir = recursive && fs.lstatSync(file).isDirectory();
            const include = this.match(matcher.include, file, desc, isDir);
            const res = include && (!matcher.exclude || !this.match(matcher.exclude, file, desc, false));

            return res;

        } else {
            throw 'invalid matcher:' + matcher;
        }
    });
}

match.and = function(...args) {
    return new AndMatch(...args);
}

module.exports = {

    getTypesRaw,

    match,

    AndMatch,

    isCyclic,

    // createExampleFinder(callback) {

    //     return {

    //     }

    // },

    /**e
     * scapes a string to be a valid variable name
     */
    escapeVariableName(name) {
        return name.replace(/\//g, '_').replace(/\./g, '_').replace(/-/g, '_');
    },

    /**
     * normalizes indention to 0
     * @param {String} string - string to indent
     * @param {String} [origIndent = null] - the amount of space to deIndent, will get auto guessed if omitted
     * @param {String} [newIndent = ''] - the new indention to have
     */
    deIndent(string, origIndent = null, newIndent = '') {

        const lines = string.split('\n');
        if (origIndent === null) {
            [, origIndent] = /(\s*)/.exec(lines[0]);//.match()
        }
        return lines.map(line => newIndent + line.replace(origIndent, '')).join('\n');
    },

    // fixTypes(el) {

    //     if (this.returns && this.returns.type) {
    //         this.returns.type.names = this.returns.type.names.map(name => {
    //             name === 'function'
    //         });
    //     }

    // }

    /**
     * util function to map function (or similar) structures into a unified format
     * @param {*} el
     */
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

        el.signature = `${el.simpleName || el.name} (${
            basicArgs.map(param => {
                let pString = param.name;//

                pString += `: ${this.getTypesRaw(param.type.names)}`;

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
                    1: {template: 'types', type: param.type},
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

    /**
     * primive runtime import
     * @param {*} script
     */
    crudeImport(script) {
        return eval(script.replace(/import/g, '//import').replace('export default', 'global.res = '));
    },

    /**
     * helper funciton to find property defaults
     * works for UIkit and Vue
     * @param {*} props
     * @param {*} runtime
     */
    findPropDefaults(props, runtime) {
        if (runtime && runtime['props']) {

            const realProps = runtime['props'];
            const ukDefaults = runtime['defaults'];

            _.forEach(props, prop => {

                const realProp = realProps[prop.name];
                if (typeof realProp !== 'undefined') {


                    prop.required = prop.required || prop.meta.code.value && ~prop.meta.code.value.indexOf('{"required":true}') || realProp && realProp.required;

                    if (!prop.type) {
                        if (realProp === null) {
                            prop.type = {names: ['null']};
                        } else if (realProp.type && (realProp.type instanceof Function)) {
                            prop.type = {names: [realProp.type.name]};
                        } else if (realProp instanceof Function) {
                            prop.type = {names: [realProp.name]};
                        } else if (typeof realProp === 'string') {
                            prop.type = {names: [realProp]};
                        } else {
                            debugger;
                        }
                    }

                    // TODO override defaultValues
                    if (ukDefaults) {
                        prop.defaultvalue = ukDefaults[prop.name];

                        if (prop.type.names.includes('list') && _.isArray(prop.defaultvalue)) {
                            prop.defaultvalue = prop.defaultvalue.join(',');
                        }
                    }
                }
            });
        }
    }
};

