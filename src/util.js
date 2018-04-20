/* eslint-env node */
const _ = require('lodash');
const webpack = require('webpack');
const MemFs = require('memory-fs');
const requireFromString = require('require-from-string');

module.exports = {

    /**
     *
     * @param {DoctoolsConfig} config
     * @param {String} filename
     * @returns {Promise} returns an object with the result of a webpacked require of the given file
     */
    webpackFile(config, filename) {
        const runtime = require(config.runtime);

        const compiler = webpack({
            ...runtime,
            entry: {
                [filename]: filename
            },
            output: {
                libraryTarget: 'commonjs'
            }
        });

        compiler.outputFileSystem = new MemFs;

        return new Promise(resolve => {

            compiler.run((err, res) => {
                const data = compiler.outputFileSystem.readFileSync(Object.keys(res.compilation.assets)[0] ,'utf8');
                try {
                    const rt = requireFromString(data);
                    resolve(rt.default ? rt.default : rt);
                } catch(e) {
                    console.warn('could not load runtime for:', filename);
                    resolve({});
                }
            });
        });
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

    findRuntime(config, desc) {

        return new Promise(res => {

            let runtime;

            // const babel = require('babel-core');
            // const res = babel.transform(desc.script);

            if (config.runtime) {

                if(_.isString(config.runtime)) {
                    this.webpackFile(config, desc.file).then(res);
                } else {
                    runtime = _.get(config.runtime, `${desc.type}.${desc.name}`) || _.get(config.runtime, desc.name);
                    res(runtime);
                }
            }


            if (!runtime && config.crudeImport) {
                try {
                    runtime = this.crudeImport(desc.script);
                } catch (e) {
                    console.warn('could not import runtime for: ' + desc.name);
                    console.warn(e);
                }
            }

        })

        return runtime;

    },

    crudeImport(script) {
        return eval(script.replace(/import/g, '//import').replace('export default', 'global.res = '));
    },

    findPropDefaults(props, runtime) {
        if (runtime && runtime['props']) {

            const realProps = runtime['props'];
            const ukDefaults = runtime['defaults'];

            _.forEach(props, prop => {

                const realProp = realProps[prop.name];
                if (typeof realProp !== 'undefined') {

                    prop.required = prop.required || prop.meta.code.value && ~prop.meta.code.value.indexOf('{"required":true}') || realProp && realProp.required;

                    if (!prop.type) {
                        if (realProp.type && realProp.type instanceof Function) {
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

