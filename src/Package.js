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

    constructor(config, parent = null) {

        super(config);

        this.parent = parent;

        this.type = 'package';

        this.resources = {};
        this.modules = {};

        this.loadPackageFile();
        this.analyzeSubPackages();
        this.loadFiles();

    }

    getRootPackage() {
        if (this.parent) {
            return this.parent.getRootPackage();
        } else {
            return this;
        }
    }

    loadPackageFile() {

        const packPath = path.join(this.path, 'package.json');
        if (fs.existsSync(packPath)) {
            this.packageJson = require(packPath);
        }

    }

    analyzeSubPackages() {

        if (this.config.subPackages){
            console.log('using subpackages:', this.config.subPackages);

            this.subPackages = this.subPackages || {};

            glob.sync(path.join(this.path, this.config.subPackages)).forEach(subPackage => {

                const res = new Package({...this.config, base:subPackage}, this);// parser.parse();

                this.resources[res.resource] = res;
                this.subPackages[res.name] = res.resource;
                // Object.assign(this.resources, res.resources);
                // delete res.resources;

            });

        }

    }

    analyze() {

        const jobs = [];

        _.forEach(this.resources, desc => {
            // if (desc.type !== 'package') {
                jobs.push(desc.analyze());
            // }
        });

        return Promise.all(jobs).then(all => {

            this.createLinks();
            this.mapGlobals();

            return this;

        });

    }

    loadFiles() {

        const files = Package.getIncludedFiles(this.config);
        files.forEach(file => {

            this.addFile(file);

        });

    }

    addFile(file, patch = false) {

        const parser = require('./parser');
        const res = parser.parse({...this.config, base:file, package: this});
        // if (!res.ignore) {
        this.addModule(res, patch);
        // }

    }

    addModule(module, patch = false) {

        const resource = module.resource;

        const existingModule = this.resources[resource];

        if (!existingModule) {

            this.resources[resource] = module;

            this.modules[module.type] = this.modules[module.type] || {};
            this.modules[module.type][module.name] = resource;//module;

        } else if (patch) {
            existingModule.reset();
        } else {
            throw 'module already existing'
        }

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

        if (_.isString(module)) {
            this.addFile(module, true);
        } else {
            this.addModule(module, true);
        }

        this.mapGlobals();

        return this.analyze().then(res => {
            this.createLinks();
            return this.serialize();
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
            resources: _.pickBy(_.mapValues(this.resources, resource => resource.serialize()), res => !res.ignore),
            config: undefined,
            parent: this.parent && this.parent.resource,
            ...this.data
        };
        return res;

    }

    //try s to match
    findDefinitionName(runtime) {
        return _.findKey(this.resources, ['runtime', runtime]);
    }

    createLinks() {

        this.config.types.forEach(type => {

            const registry = _.cloneDeep(this.modules[type]);

            _.forEach(registry, resource => {

                const comp = this.resources[resource];
                const runtime = comp.runtime

                this[type] = this[type] || {};
                this[type][comp.name] = resource;

                if (this.packageJson && this.packageJson.main && path.resolve(path.join(this.path, this.packageJson.main)) === path.resolve(comp.path)) {
                    this.main = comp;
                }

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
                        const definition = mixin && _.find(this.resources, ['runtime', mixin]);

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

                                const def = this.resources[desc.name];
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

                    });

                }

            });
        });

    }
}

Package.getIncludedFiles = function(config) {
    return glob.sync(path.join(config.base, config.search || '**/*.+(js|vue)'));
};

module.exports = Package;