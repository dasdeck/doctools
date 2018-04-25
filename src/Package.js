const _ = require('lodash');
const util = require('./util');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const TreeItem = require('./TreeItem');
const Module = require('./Module');

/**
 * the Package parser
 */
module.exports = class Package extends TreeItem {

    constructor(config, file = config.base, parent = null) {


        super(config, file, parent);

        this.type = 'package';

        this.resources = {};
        // this.modules = {};

        this.loadPackageFile();
        this.analyzeSubPackages();
        this.loadFiles();

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
            this.getPackageModules().forEach(res => {
                if (pathToMain === path.resolve(res.path)) {

                    this.main = res.resource;
                }
            });

        }
    }

    analyzeSubPackages() {

        if (this.config.subPackages){
            // console.log('using subpackages:', this.config.subPackages);

            this.subPackages = this.subPackages || {};

            glob.sync(path.join(this.path, this.config.subPackages)).forEach(subPackage => {

                const res = new Package(this.config, subPackage, this);// parser.parse();
                this.subPackages[res.name] = res.resource;
                this.resources[res.resource] = res;

                // Object.assign(this.resources, res.resources);
                // delete res.resources;

            });

        }

    }

    findPackageForFile(file) {


        let res = file.includes(this.path) ? this : null;

        _.forEach(this.subPackages, pack => {
            pack =  this.resources[pack];
            const sub = pack.findPackageForFile(file);
            if(sub) {
                res = sub;
            }
        })

        return res;
    }

    getPackageModules() {
        return Object.values(this.resources).filter(res => res instanceof Module);
    }

    getAllModules() {
        let modules = this.getPackageModules();
        _.forEach(this.subPackages, subPackage => {
            modules = modules.concat(this.resources[subPackage].getAllModules());
        })

        return modules;
    }

    analyze() {

        const mods = Object.values(this.resources).map(mod => mod.analyze());
        return Promise.all(mods)
        .then(res => this.execPluginCallback('onAnalyze'))
        .then(all => this.map())
        .catch(res => {
            debugger;
        })

    }

    loadFiles() {

        const files = this.getIncludedFiles(true);
        files.forEach(file => {

            this.addFile(file);

        });

    }

    addFile(file, patch = false) {

        const res = new Module(this.config, file , this);// parser.parse();
        this.addModule(res, patch);

    }

    addModule(module, patch = false) {

        const resource = module.resource;

        const existingModule = this.resources[resource];

        if (!existingModule) {

            this.resources[resource] = module;

            // this.modules[module.type] = this.modules[module.type] || {};
            // this.modules[module.type][module.name] = resource;//module;

        } else if (patch) {

            existingModule.patch(module);

        } else {

            throw 'module already existing'

        }

    }

    /**
     *
     */
    map() {

        this.globals = {
            trigger: []
        };

        const jobs = [];

        _.forEach(this.resources, module => {

            jobs.push(module.map().then(() => {

                _.forEach(module.trigger, trigger => {

                    trigger.source = module.name;

                    trigger.simpleName = trigger.name;
                    util.mapParams(trigger);
                    this.globals.trigger.push(trigger);

                });
            }));

        });

        return Promise.all(jobs)
        .then(() => this.execPluginCallback('onMap'));

    }

    /**
     * patches this package
     * @param {*} module
     */
    patch(file) {

        const pack = this.findPackageForFile(file);

        if(pack) {


            pack.execPluginCallback('onPatch');

            if (_.isString(file)) {
                pack.addFile(file, true);
            } else {
                pack.addModule(file, true);
            }
        }

    }

    /**
     * returns a list of files inculed in this package
     * @param {*} excludeSubPackageFiles
     */
    getIncludedFiles(excludeSubPackageFiles = false) {
        const conf = {};

        if(excludeSubPackageFiles && _.isString(this.config.subPackages)) {
            conf.ignore = this.config.subPackages;
        }

        return glob.sync(path.join(this.path, this.config.search), conf);
    }

    /**
     * strips data that is not needed in the UI or elsewhere
     * and is potentially large and/or circular
     */
    serialize() {

        this.execPluginCallback('onSerialize');

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
                resources: _.pickBy(_.mapValues(this.resources, resource => resource.resource), res => !res.ignore),
                config: undefined,
                parent: this.parent && this.parent.resource,
                ...this.data
            };

    }



    getResources() {

        const resources = {};
        resources[this.resource] = this.serialize();

        _.forEach(this.resources, resource => {
            if (resource.getResources) {
                _.merge(resources, resource.getResources());
            } else {
                resources[resource.resource] = resource.serialize();
            }
        });

        return resources;
    }

    getDataPackage() {
        return {
            resources: this.getResources(),
            rootPackage: this.resource
        }
    }





}
