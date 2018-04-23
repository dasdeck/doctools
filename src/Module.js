/* eslint-env node*/

const _ = require('lodash');
const jsdoc = require('jsdoc-api');
const utils = require('./util');
const TreeItem = require('./TreeItem');
const componentMappper = require('./componentMapper');


class Module extends TreeItem {

    constructor(config, desc, pack = null) {

        super(config);

        this.type = this.type || 'module';

        this.package = pack && pack.resource;

        _.assign(this, desc);
        const entries = jsdoc.explainSync({source: this.script});
        this.init(entries, config);//this.init(entries);
        this.map();

    }

    analyze() {

        return new Promise(res => {
            if (this.runtime) {
                res(this);
            } else {
                utils.findRuntime(this.config, this).then(runtime => {
                    this.runtime = runtime;

                    this.map();

                    res(this);

                });
            }
        });

    }

    /**
     * applys custom mapping to module types
     */
    map() {
        if (Module.mapper[this.type]) {
            Module.mapper[this.type](this);
        }
    }



    /**
     * @override
     */
    serialize() {
        return {...this, config: undefined, runtime: undefined};
    }

        /**
     * maps the jsdoc list to a sorted structure
     * @param {*} all
     * @param {*} config
     */
    init(all, config) {

        const desc = {all, documented: []};

        all.forEach(el => {

            if (el.kind === 'function' && !el.undocumented) {

                this.analyseFunction(el, config);

            }
            if (el.kind === 'file') {

                desc.description = el.description;
                if (el.type) {
                    desc.type = el.type.names[0];
                } else if(el.ignore) {
                    desc.ignore = true;
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
                    const orig = _.find(desc.types[el.kind], func => func.name === el.see[0]);
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


                if (desc[el.kind] && !_.isArray(desc[el.kind])) {
                    debugger
                }
                desc.types = desc.types || {};
                desc.types[el.kind] = desc.types[el.kind] || [];
                desc.types[el.kind].push(el);

                desc.documented.push(el);
            }
        });

        _.assign(this, desc);

        return desc;
    }

    /**
     * "guesses" functions default parameters by parsing the code
     * @param {Object} el - the JSDoc function descriptor
     */
    guessDefaultParamValues(el) {

        //extract default values
        const regex = RegExp(/name\((.*?)\)\s*{/.source.replace('name', el.name));
        const res = regex.exec(this.script);
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

            const more = regex.exec(this.script);
            if (more && more.index !== res.index) {
                throw 'could not find unique method definition for: ' + el.longname + ' in: ' + this.script;
            }
        }

    }

    analyseFunction(el, config) {

        el.simpleName = el.longname === `module.exports.${el.name}` ? el.name : el.longname;

        if (config.inferParameterDefaults) {
            this.guessDefaultParamValues(el);
        }

        if (el.params) {

            Object.assign(el, utils.mapParams(el));

        } else {

            //empty default signature
            el.signature = `${el.simpleName}()`;
        }

        //add first return statement to signature
        if (el.returns && el.returns[0]) {
            el.signature += ` : ${utils.getTypesRaw(el.returns[0].type.names)}`;
        }

        return el;
    }

}

Module.mapper = {
    'VueComponent'(desc) {

        const res = componentMappper.map(desc);
        Object.assign(desc, res);
        if (desc.template) {
            componentMappper.parseTemplate(desc);
        }
    },
    'UIkitComponent'(desc) {
        const res = componentMappper.map(desc);
        Object.assign(desc, res);
    }
};

module.exports = Module;