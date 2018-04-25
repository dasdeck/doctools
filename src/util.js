/* eslint-env node */
const _ = require('lodash');

const getTypesRaw = arr => arr ? arr.join(' | ') : '';

module.exports = {

    getTypesRaw,

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
                    1: this.getTypesRaw(param.type.names),
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
                        if (realProp.type && (realProp.type instanceof Function)) {
                            prop.type = {names: [realProp.type.name]};
                        } else if(realProp instanceof Function) {
                            prop.type = {names: [realProp.name]};
                        } else if(typeof realProp === 'string') {
                            prop.type = {names: [realProp]};
                        } else if(realProp === null) {
                            prop.type = {name: ['null']};
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

