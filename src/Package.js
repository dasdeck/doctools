const _ = require('lodash');
const util = require('./util');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const TreeItem = require('./TreeItem');

/**
 * the Package parser
 */
class Package extends TreeItem {

    constructor(config) {

        super(config)

        this.type = 'package';

        this.resources = {};
        this.modules = {};
        this.runtime = {};


        this.analyzeSubPackages();
        this.init();
        this.createLinks();
        this.mapGlobals();

    }

    init() {

        const packPath = path.join(this.path, 'package.json');
        if (fs.existsSync(packPath)) {
            this.packageJson = require(packPath);
        }



        const files = Package.getIncludedFiles(this.config);
        files.forEach(file => {

            this.addFile(file);

        });

    }

    analyzeSubPackages() {

        if (this.config.subPackages){
            console.log('using subpackages:', this.config.subPackages);

            this.subPackages = {};
            glob.sync(path.join(this.path, this.config.subPackages)).forEach(subPackage => {

                const parser = require('./parser');

                const res = parser.parse({...this.config, base:subPackage});

                this.resources[res.resource] = res;
                Object.assign(this.resources, res.resources);
                this.subPackages[res.name] = res.resource;
                delete res.resources;

            });

        }

    }

    addFile(file) {

        const parser = require('./parser');
        const res = parser.parse({...this.config, base:file, package: this});
        if (!res.ignore) {
            this.addModule(res);
        }

    }

    analyzeRuntime() {

        return new Promise(res => {

            const jobs = [];
            _.forEach(this.resources, desc => {

                if(!this.runtime[desc.resource]) {
                    const job = util.findRuntime(this.config, desc).then(runtime => {
                        this.runtime[desc.resource] = runtime;
                    });
                    jobs.push(job);
                }
            })

            Promise.all(jobs).then(all => res(this));

        });

    }

    addModule(module) {

        const resource = module.resource;

        this.resources[resource] = module;

        delete this.runtime[resource]; //clear runtime cache;

        this.modules[module.type] = this.modules[module.type] || {};
        this.modules[module.type][module.name] = resource;//module;

    }

    mapGlobals() {

        this.globals = {
            trigger: []
        };

        _.forEach(this.resources, module => {
            _.forEach(module.trigger, trigger => {
                trigger.source = module.name;

                trigger.simpleName = trigger.name;
                util.mapParams(trigger);
                this.globals.trigger.push(trigger);
            });
        });

    }

    patch(module) {

        return new Promise(resolve => {

            if (_.isString(module)) {
                this.addFile(module);
            } else {
                this.addModule(module);
            }

            this.mapGlobals();

            this.analyzeRuntime().then(res => {
                this.createLinks();
                resolve(this.serialize());
            })
        });

    }

    /**
     * strips data that is not needed in the UI or elsewhere
     * and is potentially large and/or circular
     */
    serialize() {

        // this.analyzeRuntime();
        // _.forEach(this.resources, resource => delete resource.config);

        const res = {
            ...this,
            resources: _.mapValues(this.resources, resource => resource.serialize()),
            config: undefined,
            runtime: undefined
        };
        return res;

    }

    //try s to match
    findDefinitionName(runtime) {
        return _.findKey(this.runtime, runtime);
    }

    createLinks(resource = this.resources) {

        const linkedModules = {};

        this.config.types.forEach(type => {


            const registry = linkedModules[type] = _.cloneDeep(this.modules[type]);

            _.forEach(registry, resource => {

                const comp = this.resources[resource];


                if (this.packageJson && this.packageJson.main && path.resolve(path.join(this.path, this.packageJson.main)) === path.resolve(comp.path)) {
                    this.main = comp;
                }

                const runtime = this.runtime[comp.resource];

                if (runtime) {

                    comp.extends =  runtime.extends && _.find(registry, ['runtime', runtime.extends]);

                    if (runtime.extends && !comp.extends) {
                        console.warn('could not link extend on: ' + comp.name);

                        comp.extends = this.findDefinitionName(runtime.extends);

                        if (!comp.extends) {
                            console.warn('could not find extend on: ' + comp.name);
                        }
                    }

                    comp.mixins = [];


                    //resolve mixins
                    _.forEach(runtime.mixins, (mixin, index) => {
                        const definition = mixin && _.find(registry, ['runtime', mixin]);

                        const name = mixin && this.findDefinitionName(mixin);
                        if(!name) {
                            console.warn('could not find mixin ' + index + ' in: ' + comp.name);
                        }
                        if(!definition) {
                            console.warn('could not link  mixin ' + (name || index) + ' for: ' + comp.name);
                        }

                        comp.mixins.push({name, linked: !!definition});

                    });


                    //merge inherited props, methods, computeds  to component
                    ['props', 'methods', 'computed'].forEach(type => {

                        const res = {};

                        const inheritanceChain = comp.extends ? [comp.extends] : [];


                        [...inheritanceChain, ...comp.mixins].forEach((desc) => {
                            if (desc) {

                                const def = registry[desc.name];
                                if(def) {
                                    _.assign(res, _.mapValues(def[type], member => ({...member, inherited: desc, _style : {...member._style, 'font-style': 'italic'}})));
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

                    })

                }

            });
        });

        _.assign(this, linkedModules);
    }
}

Package.getIncludedFiles = function(config) {
    return glob.sync(path.join(config.base, config.search || '**/*.+(js|vue)'));
};

module.exports = Package;