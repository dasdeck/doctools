
const _ = require('lodash');
const jsdoc = require('jsdoc-api');
const Plugin = require('./Plugin');
const util = require('../util');

module.exports = class ModulePlugin extends Plugin {

    /**
     *
     * @param {Object} desc
     * @returns {Boolean}
     */
    matchesType(desc) {
        return desc.type !== 'package';
    }

    onAnalyze(desc) {

        return jsdoc.explain({source: desc.script}).then(all => {
            desc.jsdoc = all;
            console.log('jsdoc parsed:', desc.name, !!all);
        });
    }

    onPatch(desc) {
        console.log('jsdoc cleared', desc.name, !!desc.all);
        delete desc.jsdoc;
        delete desc.module;
    }

    /**
     * maps the jsdoc list to a sorted structure
     * @param {*} all
     * @param {*} config
     */
    onMap(desc) {

        const all = desc.jsdoc;
        console.log('mapping module', desc.name, !!all);

        const config = desc.config;
        const res = {all, documented: []};

        all.forEach(el => {

            if (el.kind === 'function' && !el.undocumented) {

                this.analyseFunction(el, desc);

            }

            if (el.kind === 'file') {

                res.description = el.description;
                if (el.type) {
                    desc.type = el.type.names[0];
                } else if(el.ignore) {
                    res.ignore = true;
                }

            }

            if (!el.undocumented) {

                el.examples && el.examples.forEach(example => {
                    const marked = require('marked');
                    marked(example, {highlight(code) {
                        //TODO collect example
                    }});
                });
                if (el.kind === 'function' && el.see) {
                    const orig = _.find(res.types[el.kind], func => func.name === el.see[0]);
                    // debugger
                    // _.assign(el, orig);
                    if (!orig) {
                        debugger;
                    } else {
                        el.reference = orig.longname;
                    }
                    // markDown.push(`## ${el.longname || el.name}`);
                    // el.description && markDown.push(el.description);
                    // markDown.push(`see: <a href="#${el.see}">${el.see}</a>`);
                }


                if (res[el.kind] && !_.isArray(res[el.kind])) {
                    debugger
                }
                res.types = res.types || {};
                res.types[el.kind] = res.types[el.kind] || [];
                res.types[el.kind].push(el);

                res.documented.push(el);
            }
        });

        desc.module = res;

        // _.assign(this, desc);

        // return desc;
    }

    /**
     * "guesses" functions default parameters by parsing the code
     * @param {Object} el - the JSDoc function descriptor
     */
    guessDefaultParamValues(el, script) {

        //extract default values
        const regex = RegExp(/name\((.*?)\)\s*{/.source.replace('name', el.name));
        const res = regex.exec(script);
        if (!res && !el.see) {
            debugger //why
        } else if (res) {
            const args = res[1].split(',').map(v => v.trim());

            args.forEach(arg => {
                const [name, value] = arg.trim().split('=').map(v => v.trim());
                if (value) {
                    const param = _.find(el.params, ['name', name]);
                    // if(!param) debugger;
                    // @TODO auto doc undocuemted default?
                    if (param && _.isUndefined(param.defaultvalue)) {
                        // debugger;
                        param.defaultvalue = value;
                        param.optional = true;
                    }
                }
            });

            const more = regex.exec(script);
            if (more && more.index !== res.index) {
                throw 'could not find unique method definition for: ' + el.longname + ' in: ' + script;
            }
        }

    }

    analyseFunction(el, desc) {

        el.simpleName = el.longname === `module.exports.${el.name}` ? el.name : el.longname;

        if (desc.config.inferParameterDefaults) {
            this.guessDefaultParamValues(el, desc.script);
        }

        if (el.params) {

            Object.assign(el, util.mapParams(el));

        } else {

            //empty default signature
            el.signature = `${el.simpleName}()`;
        }

        //add first return statement to signature
        if (el.returns && el.returns[0]) {
            el.signature += ` : ${util.getTypesRaw(el.returns[0].type.names)}`;
        }

        return el;
    }

};