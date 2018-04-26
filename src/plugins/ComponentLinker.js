const Plugin = require('./Plugin');
const util = require('../util');
const _ = require('lodash');
const Package = require('../Package');

module.exports = class ComponentLinker extends Plugin {


    /**
     *
     * @param {Object} desc
     * @returns {Boolean}
     */
    matchesType(desc) {
        const isPackage = desc.type === 'package' || desc instanceof Package;
        const matches = isPackage && desc.isRootPackage();
        return matches;

    }

    /**
     * 
     * @param {*} desc 
     */
    onMap(pack) {

        pack.config.types.forEach(type => {

            const resources = _.keyBy(pack.getAllModules(), 'resource');

            _.forEach(resources, desc => {

                const comp = desc.component;
                const runtime = desc.runtime

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

                        const resource = definition && definition.resource;

                        // if(!name) {
                        //     console.warn('could not find mixin ' + index + ' in: ' + comp.name);
                        // }
                        if(!definition) {
                            console.warn('could not link/find  mixin ' + (name || index) + ' for: ' + comp.name);
                        }

                        comp.mixins.push({resource, linked: !!definition});

                    });

                    //merge inherited props, methods, computeds  to component
                    ['props', 'methods', 'computed'].forEach(type => {

                        const res = {};

                        const inheritanceChain = comp.extends ? [comp.extends] : [];

                        [...inheritanceChain, ...comp.mixins].forEach(desc => {
                            if (desc) {

                                const def = resources[desc.resource];
                                if(def) {
                                    const props = _.mapValues(def.component[type], member => {
                                        return {
                                            ...member,
                                            inherited: !!desc,
                                            _style : {
                                                ...member._style,
                                                'font-style': 'italic'
                                            }
                                        };
                                    });
                                    _.assign(res, props);
                                }
                                if(desc.linked !== !!def) {
                                    debugger
                                }

                            } else {
                                debugger;
                            }
                        });

                        _.assign(res, comp[type]);

                        //find prop defaults again, as default may change in inherited type
                        util.findPropDefaults(res, comp.runtime);

                        comp[type] = res;

                    });

                }

            });
        });
        // this.linked = true;
    }

}