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

    onConstruct(pack) {
        this.pack = pack;
    }


    getLink(runtime, warning = null) {

        if (runtime !== undefined) {

            const resources = _.keyBy(this.pack.getAllModules(), 'resource');
            const res = _.find(resources, res => res.runtime === runtime);

            if(res && res.runtime !== runtime) {
                debugger
            }

            if(!res && warning) {
                this.pack.log(warning);
            }

            return {resource: res && res.resource};
        }
    }

    /**
     *
     * @param {*} desc
     */
    onMap(pack) {

            const resources = _.keyBy(pack.getAllModules(), 'resource');

            _.forEach(resources, desc => {

                const comp = desc.component;
                const runtime = desc.runtime

                if (runtime && comp) {

                    comp.extends = this.getLink(runtime.extends, 'could not link extend on: ' + desc.path);

                    ['mixins', 'components'].forEach(name => {


                        if(runtime[name]) {
                            comp[name] = _.map(runtime[name], (mixin, index) => {
                                return this.getLink(mixin, 'could not link/find  mixin ' + index + ' for: ' + desc.path);
                            });
                            // debugger;
                        }

                    });


                    // debugger;
                    //merge inherited props, methods, computeds  to component
                    ['props', 'methods', 'computed'].forEach(type => {

                        const res = {};

                        // if (comp.mixins || comp.extends) {
                        //     debugger;
                        // }

                        let inheritanceChain = comp.extends ? [comp.extends] : [];
                        if (comp.mixins) {
                            inheritanceChain = inheritanceChain.concat(comp.mixins);
                        }

                        inheritanceChain.forEach(desc => {
                            if (desc) {

                                const def = resources[desc.resource];
                                if(def) {
                                    if(!def.component) {
                                        debugger;
                                    }
                                    const props = _.mapValues(def.component[type], member => {
                                        return {
                                            ...member,
                                            inherited: desc.resource,
                                            _style : {
                                                ...member._style,
                                                'font-style': 'italic'
                                            }
                                        };
                                    });
                                    _.assign(res, props);
                                }

                                if(!!desc.resource !== !!def) {
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

                desc.component = _.pickBy(comp, type => _.size(type));

            });
        // this.linked = true;
    }

}