
const _ = require('lodash');
const RuntimeAnalyzer = require('./RuntimeAnalyzer');
const util = require('./util');
const {findPropDefaults} = require('./util');

let base; //= 'module.exports';

/**
 * @file
 * the componentmapper offers functions to map a regular jsdoc file into a meaningfull json structure
 * it can also enrich the jsdoc structure with valuable runtime informations
 */

function findMembers(data, name) {

    const props = {};

    data.forEach(el => {

        const longAdd = base + '.' + name;
        if (['member', 'function', 'event'].includes(el.kind)&& el.memberof && el.memberof === longAdd) {
            el.simpleName = el.name;
            props[el.name] = el;
        }

    });
    return props;
}

function findProps(data, runtime) {
    const res = findMembers(data, 'props');

    //
    if (runtime) {
        findPropDefaults(res, runtime);
    }

    return res;

}

function findData(data) {
    const res = {};
    data.forEach(el => {
        if (!el.undocumented && el.kind === 'member' && el.scope === 'global') {
            res[el.name] = el;
        }
    });

    return res;
}

function findEvents(data) {

    const emit = {};
    data.forEach(el => {
        if (el.kind === 'event') {
            emit[el.name] = el;
        }
    });
    return emit;
}

function findMethods(data) {
    const res = findMembers(data, 'methods');
    // const parser = require('./Module');
    _.forEach(res, func => {
        // const fun = parser.analyseFunction(func, name);
        func.signature = func.signature && func.signature.split('.methods.').pop();
        res[func.name] = func;

    });
    return res;
}

const Plugin = require('./Plugin');

module.exports = class ComponentPlugin extends Plugin {

    onMap(desc) {
        this.map(desc);
    }

    getRuntimeService(desc) {
        if (!this.runtimeService) {
            this.runtimeService = RuntimeAnalyzer.getInstance(desc.package.getRootPackage());
            
        }
        return this.runtimeService;
    }

    onPatch() {
        // this.linked = false;
        this.getRuntimeService().rebuild();
    }

    onSerialize(desc) {
        if (desc.type === 'package' && desc.isRootPackage()) {
            this.createLinks(desc);
        }
    }

    createLinks(desc) {

        // if (this.linked) {
        //     return;
        // }

        desc.config.types.forEach(type => {

            const resources = desc.resources;

            _.forEach(desc.resources, comp => {

                const runtime = comp.runtime


                if (runtime) {

                    comp.extends =  runtime.extends && _.find(resources, {runtime: runtime.extends});

                    if (runtime.extends && !comp.extends) {
                        console.warn('could not link extend on: ' + comp.name);

                        comp.extends = _.findKey(resources, {runtime: runtime.extends});

                        if (!comp.extends) {
                            console.warn('could not find extend on: ' + comp.name);
                        }
                    }

                    comp.mixins = [];

                    //resolve mixins
                    _.forEach(runtime.mixins, (mixin, index) => {
                        const definition = _.find(resources, res => {
                            return res.runtime === mixin;
                        });

                        const name = definition && definition.resource;

                        // if(!name) {
                        //     console.warn('could not find mixin ' + index + ' in: ' + comp.name);
                        // }
                        if(!definition) {
                            console.warn('could not link/find  mixin ' + (name || index) + ' for: ' + comp.name);
                        }

                        comp.mixins.push({name, linked: !!definition});

                    });

                    //merge inherited props, methods, computeds  to component
                    ['props', 'methods', 'computed'].forEach(type => {

                        const res = {};

                        const inheritanceChain = comp.extends ? [comp.extends] : [];

                        [...inheritanceChain, ...comp.mixins].forEach((desc) => {
                            if (desc) {

                                const def = resources[desc.name];
                                if(def) {
                                    _.assign(res, _.mapValues(def.data[type], member => ({...member, inherited: !!desc, _style : {...member._style, 'font-style': 'italic'}})));
                                }
                                if(desc.linked !== !!def) {
                                    debugger
                                }

                            } else {
                                debugger;
                            }
                        });

                        _.assign(res, comp.data[type]);

                        //find prop defaults again, as default may change in inherited type
                        util.findPropDefaults(res, comp.runtime);

                        comp.data[type] = res;

                    });

                }

            });
        });
        // this.linked = true;
    }

    /**
     * helper function to load the runtime for a component or module
     * @param {*} config
     * @param {*} desc
     */
    onAnalyze(desc) {

        const {config} = desc;

        if (config.runtime) {

            if (_.isString(config.runtime)) {

                const serv = this.getRuntimeService(desc);
                return serv.getRuntime(desc.resource).then(runtime => {
                    desc.runtime = runtime;
                });

                // return this.webpackFile(config, desc.path);

            } else {
                const runtime = _.get(config.runtime, `${desc.type}.${desc.name}`) || _.get(config.runtime, desc.name);
                return Promise.resolve(runtime || {});
            }
        }

        if (config.crudeImport) {
            try {
                return Promise.resolve(this.crudeImport(desc.script));
            } catch (e) {
                console.warn('could not import runtime for: ' + desc.name);
                console.warn(e);
            }
        }

        return Promise.resolve({});

    }

    map(desc) {
        const data = desc.data;

        if (!data || !data.types) debugger;

        const {documented: entries, types: {function: funcs}} = data;
        const runtime = desc.runtime;

        base = 'module.exports';
        data.all.forEach(entry => {
            if ((entry.type && entry.type.names.includes(data.type)) && entry.kind === 'constant') {
                base = entry.longname;
            }
        });

        [
            {props: findProps},
            {data: findData},
            'computed',
            {methods: findMethods},
            'events',
            {emit: findEvents},
            {trigger: data => data.filter(el => el.kind === 'trigger')},
            {components: (data, runtime) => ['test']}
        ].forEach(type => {

            const simple = typeof type === 'string';

            const name = simple ? type : Object.keys(type)[0];

            const members = simple ? findMembers(entries, name, runtime) : type[name](entries, runtime);
            if (_.size(members)) {
                data[name] = members;

                //remove functions form the general function list
                _.forEach(members, member => {
                    _.remove(funcs, func => func === member);
                });
            }

        });

        entries.forEach(el => {
            if (el.longname === base) {
                data.description = el.description;
            }
        });

        return data;
    }

};