/* eslint-env node*/

const _ = require('lodash');
const jsdoc = require('jsdoc-api');



const getTypesRaw = arr => arr ? arr.join(' | ') : '';
const getTypes = arr => arr ? arr.join(' &#124; ').replace(/\*/, '&#42;') : '';

module.exports = {

    analyzeModule(source) {
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

    analyseFunction(el) {

        if (el.params) {

            Object.assign(el, this.mapParams(el));

        } else {
            el.signature = `${el.longname}()`;
            // const text = _.get(require('./dist/utils.cjs.js'), el.longname) + '';
            // func.signature = text.substr(0, text.indexOf('{')).replace('function', '').trim();
        }

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
                }

            } else if (el.kind === 'function' && !el.undocumented) {

                this.analyseFunction(el);

            }

            if (!el.undocumented) {
                if (el.see) {
                    // debugger
                    // markDown.push(`## ${el.longname || el.name}`);
                    // el.description && markDown.push(el.description);
                    // markDown.push(`see: <a href="#${el.see}">${el.see}</a>`);
                } else {
                    desc[el.kind] = desc[el.kind] || [];
                    desc[el.kind].push(el);
                    desc.documented.push(el);
                }
            }
        });

        return desc;
    }
};