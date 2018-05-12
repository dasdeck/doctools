const Plugin = require('../Plugin');
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
        return desc.isRootPackage();

    }

    onLoad(pack) {
        this.pack = pack;
    }

       /**
     *
     * @param {*} desc
     */
    onLink(pack) {

        const resources = _.keyBy(pack.getAllModules(), 'resource');

        _.forEach(resources, desc => {

            const comp = desc.component;
            const runtime = desc.runtime

            if (runtime && comp) {

                comp.extends = this.getLink(runtime.extends, 'could not link extend on: ' + desc.path);

                if (comp.extends && !desc.template) {
                    const linked = resources[comp.extends.resource];
                    if (linked && linked.template) {
                        desc.template = {
                            ...linked.template,
                            inherited: linked.resource
                        }
                    }
                }

                ['mixins', 'components'].forEach(name => {


                    if(runtime[name]) {
                        comp[name] = _.map(runtime[name], (mixin, index) => {
                            return this.getLink(mixin, 'could not link/find  mixin ' + index + ' for: ' + desc.path);
                        });
                    }

                });

                //merge inherited props, methods, computeds  to component
                ['props', 'methods', 'computed'].forEach(type => {

                    const res = {};

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


}