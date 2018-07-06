const Plugin = require('../Plugin');
const util = require('../util');
const _ = require('lodash');

module.exports = class ComponentLinker extends Plugin {

    /**
     *
     * @param {*} desc
     */
    onLink(app) {

        const resources = app.resources;// _.keyBy(app.getAllModules(), 'resource');

        _.forEach(resources, desc => {

            const comp = desc.component;
            const runtime = desc.runtime;

            if (runtime && comp) {

                comp.extends = this.getLink(runtime.extends, 'could not link extend on: ' + desc.path);

                if (comp.extends && !desc.template) {
                    const linked = resources[comp.extends.resource];
                    if (linked && linked.template) {
                        desc.template = {
                            ...linked.template,
                            inherited: linked.resource
                        };
                    }
                }

                ['mixins', 'components'].forEach(name => {

                    if (runtime[name]) {
                        comp[name] = _.map(runtime[name], (mixin, index) => {
                            return this.getLink(mixin, 'could not link/find  mixin ' + index + ' for: ' + desc.path);
                        });
                    }

                });

                //merge inherited props, methods, computeds  to component
                ['props', 'methods', 'computed', 'emit'].forEach(type => {

                    const res = {};

                    let inheritanceChain = comp.extends ? [comp.extends] : [];
                    if (comp.mixins) {
                        inheritanceChain = inheritanceChain.concat(comp.mixins);
                    }

                    inheritanceChain.forEach(desc => {
                        if (desc) {

                            const def = resources[desc.resource];
                            if (def) {
                                if (!def.component) {
                                    throw 'expected module to have a component';
                                }
                                const props = _.mapValues(def.component[type], member => {
                                    return {
                                        ...member,
                                        inherited: desc.resource,
                                        _style: {
                                            ...member._style,
                                            'font-style': 'italic'
                                        }
                                    };
                                });
                                _.assign(res, props);
                            }

                            if (!!desc.resource !== !!def) {
                                throw 'unexpected module structure';
                            }
                        } else {
                            throw 'unexpected module structure';
                        }
                    });

                    _.assign(res, comp[type]);

                    //find prop defaults again, as default may change in inherited type
                    util.findPropDefaults(res, comp.runtime);

                    comp[type] = res;

                });

            }

            desc.component = _.pickBy(comp, type => _.size(type));

            this.applyCustomizations(desc);

        });
    }

    applyCustomizations(desc) {

        if (!desc.module) {
            return;
        }

        if (desc.module.exclude) {
            _.forEach(desc.module.exclude, (members, type) => {

                _.forEach(desc.module.exclude[type], (value, name) => {
                    const current = _.find(desc.component[type], desc => desc.name === name);
                    if (current) {
                        current.access = 'private';
                    }
                });

            });
        }

        if (desc.module.customize) {

            _.forEach(desc.module.customize, (members, type) => {

                _.forEach(desc.module.customize[type], (value, name) => {
                    const current = _.find(desc.component[type], desc => desc.name === name);
                    if (current) {
                        Object.assign(current, value);
                    }
                });

            });
        }

        if (desc.module.structure) {
            const result = {};
            _.forEach(desc.module.structure, (members, type) => {

                _.forEach(desc.module.structure[type], name => {
                    const current = _.find(desc.component[type], desc => desc.name === name);
                    if (current) {
                        result[type] = result[type] || {};
                        result[type][name] = current;
                    }
                });

            });

            desc.component = result;
        }
    }

    getLink(runtime, warning = null) {

        if (runtime !== undefined) {

            const res = _.find(this.app.resources, res => res.runtime === runtime);

            if (res && res.runtime !== runtime) {
                throw 'unexpected runtime mapping';
            }

            if (!res && warning) {
                this.pack.log(warning);
            }

            return {resource: res && res.resource};
        }
    }

};