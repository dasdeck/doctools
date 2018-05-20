const _ = require('lodash');
const jsdoc = require('jsdoc-api');
const Plugin = require('../Plugin');
const util = require('../util');
const fs = require('fs');

class ModuleMapper extends Plugin {

    constructor(config = ModuleMapper.defaultConfig) {
        super();

        this.config = config;

    }

    onAnalyze(app) {

        return Promise.all(_.map(app.resources, desc => {

            if (desc.jsdoc) {
                return Promise.resolve();
            } else {

                if (desc.script) {

                    return jsdoc.explain({source: desc.script}).then(jsdoc => {
                        desc.jsdoc = jsdoc;
                        app.log('jsdoc parsed:', desc.name, !!jsdoc);
                    }).catch(e => {
                        debugger;
                        app.log('error while jsdoc:', desc.path);
                    });

                }
            }
        }));
    }

    onSerialize(desc, data) {

        data.module = _.pick(desc.module, ['global', 'description', 'type']);

    }

    onWriteModuleCache(desc, data) {
        data.jsdoc = desc.jsdoc;
    }

    onLoadModule(desc) {

        this.app.log('jsdoc cleared', desc.name, !!desc.jsdoc);
        delete desc.jsdoc;
        delete desc.module;
    }

    onMap(app) {
        _.forEach(app.resources, res => {
            if(res.jsdoc) {
                this.onMapModule(res);
            }
        });
    }

    /**
     * maps the jsdoc list to a sorted structure
     * @param {*} all
     * @param {*} config
     */
    onMapModule(desc) {

        const all = _.cloneDeep(desc.jsdoc)
                        .filter(el => el.kind !== 'package');

        all.forEach(el => {
            if (el.meta) {
                delete el.meta.filename;
                delete el.meta.path;
                // delete el.meta.code
            }
        });

        const config = desc.config;
        const res =  desc.module = {all, global: {}, types: {}};

        if (!all) debugger;

        all.forEach((el, index) => {

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

            //put to hirarchy
            const parent = _.find(all, els => els.longname === el.memberof);
            if (parent) {

                parent.children = parent.children || {}
                this.addMemberTo(el, parent.children);

            } else {
                this.addMemberTo(el, res.global);
            }

            if (el.kind === 'function') {
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

                const name = el.type && el.type.names[0] || el.longname;

                if (res.types[name]) {
                    desc.app.log('type already defined in package:', name);
                } else {

                    desc.app.log('found type:', name);
                    res.types[name] = desc.resource;

                }

            }

            if (!el.undocumented) {

                if (el.kind === 'function' && el.see) {

                }

                if (res[el.kind] && !_.isArray(res[el.kind])) {
                    debugger
                }

            }

            delete el.code;
            // delete el.meta;
            delete el.extras;
            delete el.comment;
        });

        res.global = this.filterDocumented(res.global);

    }

    addMemberTo(el, target) {

        let existing = target[el.longname];

        if (existing) {

            let current = el;
            //prefer documented member
            if (existing.undocumented) {
                target[current.longname] = current;
                [current, existing] = [existing, current];

            }

            if  (!existing.meta) {
                // debugger;
                console.warn('unhandled el:', el);
                return;
            }

            const type = existing.meta.code.type;

            existing.extras = existing.extras || {};

            const existingExtra  = existing.extras[type];
            if (existingExtra) {

                if (!!_.isArray(existingExtra)) {
                    existing.extras[type] = [existingExtra]
                }

            }

            existing.extras[type] = current;

        } else {

            target[el.longname] = el;

        }
    }

    filterDocumented(els) {
        const res = {};

        _.forEach(els, (el, key) => {
            if (this.isDocumented(el)) {
                res[key] = el;
                if (el.children) {
                    el.children = this.filterDocumented(el.children);
                }
            }

        })

        return res;
    }

    isDocumented(el) {

        return !el.undocumented || el.children && _.some(el.children, child => this.isDocumented(child));

    }

    /**
     * "guesses" functions default parameters by parsing the code
     * @param {Object} el - the JSDoc function descriptor
     */
    guessDefaultParamValues(code, name = ".*") {

        const params = {};
        //extract default values
        //(?:name|function|=>|=|:)\s*
        const regex = RegExp(/(?:\((.*?)\)|(\w+))\s*(?:=>|{)/.source.replace('name', name));
        const res = regex.exec(code);
        if (!res) {
            // debugger //why
            console.error('could not determine function name for:', name, 'in:', code);
        } else if (res) {
            const pars = res[1];
            if (pars) {

                const args = pars.split(',').map(v => v.trim());

                args.forEach(arg => {
                    const [name, value] = arg.trim().split('=').map(v => v.trim());

                    params[name] = value;

                });
            }

            const more = regex.exec(code);

            if (more && more.index !== res.index) {
                throw 'could not find unique method definition for: ' + name + ' in: ' + script;
            }

            return params;
        }

    }

    analyseFunction(el, desc) {

        if (el.simpleName) {
            debugger;
        }

        //might be function alias?
        if (el.see) {
            const orig = _.find(desc.module.all, func => func.name === el.see[0]);

            if (!orig) {
                debugger;
            } else {
                el.reference = orig.longname;
            }
        }

        el.simpleName = el.longname === `module.exports.${el.name}` ? el.name : el.longname;

        let params;
        if (!el.reference && desc.config.inferParameterDefaults) {
            params = this.guessDefaultParamValues(el.code, el.name);
            delete el.code;
            //delete code to save space
        }

        const mappedPrams = util.mapParams(el.params || [], params);
        el.params = mappedPrams.params;
        el.tables = mappedPrams.tables;

        return el;
    }

};

ModuleMapper.defaultConfig = {
    getAssets(desc) {
        return {readme: desc.path + '.md'};
    }
}

module.exports = ModuleMapper;