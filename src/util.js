/* eslint-env node */
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const getTypesRaw = arr => arr ? arr.join(' | ') : '';



module.exports = {

    getTypesRaw,

    match: require('megamatch'),

    getCodeBlocks(text, fences = ['```']) {

        const blocks = [];
        fences = Array.isArray(fences) && fences || [fences];
        const reg = new RegExp(/(fences)(.*)\n(.*)\n\1/g.source.replace('fences', fences.join()));
        let res;
        while (res = reg.exec(text)) {
            blocks.push({
                lang: res[2],
                code: res[3]
            });
        }

        return blocks;

    },

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
    mapParams(params, defaults) {

        const tables = {};

        const options = {0: []};

        const rootParams = params.filter(param => !~param.name.indexOf('.'));

        if (defaults) {

            _.forEach(defaults, (defaultvalue, name) => {
                const def = _.find(params, param => param.name === name);
                if (!def) {
                    rootParams.push({
                        name,
                        defaultvalue
                    })
                }
            });

            //compare found params
            rootParams.forEach(param => {
                if (!param.name in defaults) {
                    debugger;
                    throw 'parameter definition mismatch'
                } else {
                    const value = defaults[param.name];

                    if (!_.isUndefined(value)) {
                        // @TODO auto doc undocuemted default?
                        if (_.isUndefined(param.defaultvalue)) {
                            param.defaultvalue = value;
                            param.optional = true;
                        }
                    }
                }
            });

        }


        //filter out prams with sub options
        params
        .filter(param => ~param.name.indexOf('.'))
        .forEach(param => {

            const [option, key] = param.name.split('.');

            const parent = _.find(params, param => param.name === option);
            if (!parent) {
                debugger;
            }

            parent.children = parent.children || {};
            parent.children[key] = param;

            options[option] = options[option] || [];
            param.name = key;
            options[option].push(param);

        });


        rootParams.forEach(param => {
            options[0].push(param);
        });

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


        return {
            tables,
            params: rootParams
        };

    },

    /**
     * primive runtime import
     * @param {*} script
     */
    crudeImport(script) {
        return eval(script.replace(/import/g, '//import').replace('export default', 'global.res = '));
    },

    /**
     * helper funciton to find property defaults, required and type
     * works for UIkit and Vue
     * @param {*} props
     * @param {*} runtime
     */
    findPropDefaults(props, runtime) {
        if (runtime && runtime['props']) {

            const realProps = runtime['props'];
            const ukDefaults = runtime['data'];

            _.forEach(props, prop => {

                const realProp = realProps[prop.name];
                if (typeof realProp !== 'undefined') {

                    prop.required = prop.required || realProp && realProp.required || prop.meta.code.value && ~prop.meta.code.value.indexOf('{"required":true}');

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

