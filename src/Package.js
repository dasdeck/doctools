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

    isRootPackage() {
        return this === this.getRootPackage();
    }

    loadPackageFile() {

        const packPath = path.join(this.path, 'package.json');
        if (fs.existsSync(packPath)) {
            this.packageJson = require(packPath);
        }

    }


    findMain() {
        if (this.packageJson && this.packageJson.main) {

            const pathToMain = path.resolve(path.join(this.path, this.packageJson.main));
            _.forEach(this.getResurces(), res => {
                if (pathToMain === path.resolve(res.path)) {

                    this.main = res.resource;
                }
            });

        }
    }

    analyzeSubPackages() {

        if (this.config.subPackages){
            console.log('using subpackages:', this.config.subPackages);

            this.subPackages = this.subPackages || {};

            glob.sync(path.join(this.path, this.config.subPackages)).forEach(subPackage => {

                const res = new Package({...this.config, base:subPackage}, this);// parser.parse();
                this.subPackages[res.name] = res.resource;
                this.resources[res.resource] = res;

                // Object.assign(this.resources, res.resources);
                // delete res.resources;

            });

        }

    }

    analyze() {

        const jobs = [];

        _.forEach(this.resources, desc => {
            if (desc.type !== 'package') {
                jobs.push(desc.analyze());
            }
        });

        return Promise.all(jobs).then(all => {

            this.mapGlobals();

            return this;

        });

    }

    loadFiles() {

        const files = this.getIncludedFiles();
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
            existingModule.patch(module);
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
            return this.getDataPackage();
        });

    }

    getIncludedFiles() {
        return glob.sync(path.join(this.config.base, this.config.search || '**/*.+(js|vue)'));
    };


    getResurces() {

        const resources = {};
        resources[this.resource] = this.serialize();

        _.forEach(this.resources, resource => {
            if (resource.type === 'package') {
                _.merge(resources, resource.getResurces());
            } else {
                resources[resource.resource] = resource.serialize();
            }
        });

        return resources;
    }

    getDataPackage() {
        return {
            resources: this.getResurces(),
            rootPackage: this.resource
        }
    }

    /**
     * strips data that is not needed in the UI or elsewhere
     * and is potentially large and/or circular
     */
    serialize() {

        // this.analyzeRuntime();
        // _.forEach(this.resources, resource => delete resource.config);



        this.execPluginCallback('onSerialize');

        // if (this.isRootPackage()) {

        //     const resources = _.pickBy(_.mapValues(this.resources, resource => resource.serialize()), res => !res.ignore);
        //     resources[this.resource] = {...this, config: undefined, ...this.data, resources: undefined};

        //     return {
        //         resources,
        //         rootPackage: this.resource
        //     }
        // } else {

            const types = {};
            _.forEach(this.resources, resource => {
                const type = resource.type;
                types[type] = types[type] || {};
                types[type][resource.name] = resource.resource;

            });

            return {
                ...this,
                package: this.resource,
                types,
                resources: undefined,//_.pickBy(_.mapValues(this.resources, resource => resource.serialize()), res => !res.ignore),
                config: undefined,
                parent: this.parent && this.parent.resource,
                ...this.data
            };
        // }

    }



}


module.exports = Package;