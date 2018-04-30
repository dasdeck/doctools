
const _ = require('lodash');
const jsdoc = require('jsdoc-api');
const Plugin = require('../Plugin');
const util = require('../util');

module.exports = class ModuleMapper extends Plugin {

    /**
     *
     * @param {Object} desc
     * @returns {Boolean}
     */
    matchesType(desc) {
        return desc.type !== 'package';
    }

    onAnalyze(desc) {

        if (desc.jsdoc) {
            return Promise.resolve();
        } else {
            return jsdoc.explain({source: desc.script}).then(all => {
                desc.jsdoc = all;
                desc.log('jsdoc parsed:', desc.name, !!all);
            }).catch(e => {
                debugger;
                desc.log('error whule jsdoc:', desc.path);
            });
        }
    }

    onSerialize(desc, data) {
        delete data.jsdoc;
    }

    onPatch(desc) {
        desc.log('jsdoc cleared', desc.name, !!desc.all);
        delete desc.jsdoc;
        delete desc.module;
    }

    /**
     * maps the jsdoc list to a sorted structure
     * @param {*} all
     * @param {*} config
     */
    onMap(desc) {

        const all = _.cloneDeep(desc.jsdoc);
        desc.log('mapping module', desc.name, !!all);

        const config = desc.config;
        const documented = all.filter(el => !el.undocumented);
        const res = {all, documented, global: []};

        if (!all) debugger;
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

            if (el.kind === 'readme') {
                debugger;
            }

            if (el.kind === 'typedef') {

                const pack = desc.package;

                // debugger
                pack.types = pack.types || {};

                const name = el.type && el.type.names[0] || el.longname;

                if (pack.types[name]) {
                    // debugger;
                    desc.log('type already defined in package:', name);
                } else {

                    desc.log('found type:', name);
                    pack.types[name] = desc.resource;

                }

            }

            let code;
            if (el.meta && el.meta.range) {

                code = desc.script.substr(el.meta.range[0], el.meta.range[1]);
                el.code = code;
            }

            //analyse eports
            let exporter;
            if (['module', 'module.exports'].includes(el.memberof) || code && code.match(/\bexport\b/)) {

                const mainExport = el.memberof === 'module' || code && code.match(/\bexport\b\s+\bdefault\b/);
                exporter = {
                    mainExport
                };

                if (!mainExport && /\bthis\b/.exec(code)) {
                    exporter.thisReferer = true;
                }

            }

            if (!el.undocumented) {

                //!['module', 'module.exports'].includes(el.memberof)
                if (desc.type === 'module') {
                    const parent = _.find(documented, els => els.longname === el.memberof);
                    if (parent) {
                        // debugger;
                        parent.children = parent.children || []
                        parent.children.push(el);
                        // el.parent = parent;

                    } else {
                        res.global.push(el);
                    }
                }

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

                // res.documented.push(el);
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
    guessDefaultParamValues(el, desc) {

        const script = desc.script;
        //extract default values
        const regex = RegExp(/name\((.*?)\)\s*{/.source.replace('name', el.name));
        const res = regex.exec(script);
        if (!res && !el.see) {
            // debugger //why
            desc.log('could not determine function name for:', el.name, 'in:', desc.path);
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

        if (el.simpleName) {
            debugger;
        }

        el.simpleName = el.longname === `module.exports.${el.name}` ? el.name : el.longname;

        if (desc.config.inferParameterDefaults) {
            this.guessDefaultParamValues(el, desc);
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