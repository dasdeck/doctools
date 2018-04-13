/* eslint-env node*/

const _ = require('lodash');
const jsdoc = require('jsdoc-api');

const {getTestCodes} = require('./testParser');

// const cover = require('./coverage/coverage.sum.json');
const covers = {};
// _.forEach(cover, (entry, name) => {
//     covers[name.split('/').pop().replace(/.js/g,'')] = entry;
// });

const getTypesRaw = arr => arr ? arr.join(' | ') : '';
const getTypes = arr => arr ? arr.join(' &#124; ').replace(/\*/, '&#42;') : '';

module.exports = {

    analyzeModule(file) {
        const entries = jsdoc.explainSync({files: file});
        return this.map(entries, file.split('/').pop().split('.').shift());
    },

    mapParams(el) {

        const tables = {};

        const result = {tables};

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

        result.signature = `${el.longname || el.name} (${
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

            const cols = ['name', 'type', 'default', 'description'];

            const rows = [];

            options[name].forEach((param, index) => {
                const row = [
                    param.name,
                    getTypes(param.type.names),
                    param.defaultvalue,
                    param.description
                ];
                rows.push(row);
            });

            const emptyCols = [];
            cols.forEach((name, index) => {
                if (!rows.some(row => row[index])) {
                    emptyCols.push(index);
                }
            });

            const table = [cols, ...rows];

            emptyCols.forEach(index => {
                table.forEach(row => {
                    row.splice(index, 1);
                });
            });

            tables[name == 0 ? 'arguments' : name] = table;

        });

        return result;

    },

    analyseFunction(el, name) {
        const func = {el};

        const tables = {};

        if (el.params) {

            Object.assign(func, this.mapParams(el));

        } else {
            func.signature = `${el.longname}(*) : *`;
            // const text = _.get(require('./dist/utils.cjs.js'), el.longname) + '';
            // func.signature = text.substr(0, text.indexOf('{')).replace('function', '').trim();
        }

        if (el.returns && el.returns[0]) {
            func.signature += ` : ${getTypesRaw(el.returns[0].type.names)}`;
        }

        func.tables = tables;

        func.tests = getTestCodes(name, el.longname);

        return func;
    },

    map(entries, name = null) {

        const coverage = covers[name] && covers[name].lines.pct;

        const file = {
            name,
            coverage,
            functions: [],
            constants: []
        };

        entries.forEach(el => {

            if (el.kind === 'file') {

                file.description = el.description;

            } else if (el.kind === 'constant' && !el.undocumented) {

                file.constants.push(el);

            } else if (el.kind === 'function' && !el.undocumented) {

                const func = this.analyseFunction(el, name);
                file.functions.push(func);

            } else if (!el.undocumented) {
                if (el.see) {
                    // debugger
                    // markDown.push(`## ${el.longname || el.name}`);
                    // el.description && markDown.push(el.description);
                    // markDown.push(`see: <a href="#${el.see}">${el.see}</a>`);
                }
            }
        });
        return file;
    }
};