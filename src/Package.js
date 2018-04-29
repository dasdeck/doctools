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

        this.init();

        this.resources = {};
        this.globals = {};

        this.loadPackageFile();
        this.analyzeSubPackages();

    }

    getPackageJsonPath() {
        return path.resolve(path.join(this.path, 'package.json'));
    }

    loadPackageFile() {

        const packPath = this.getPackageJsonPath();
        if (fs.existsSync(packPath)) {
            this.script = fs.readFileSync(packPath, 'utf8');
            this.packageJson = JSON.parse(this.script);
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

    addPackage(pack) {

        this.packages = this.packages || {};
        this.packages[pack.name] = pack;
        // this.resources[pack.resource] = pack;
    }

    analyzeSubPackages() {

        if (this.config.subPackages){

            if (_.isString(this.config.subPackages)) {

                const packages = glob.sync(path.join(this.path, this.config.subPackages));

                packages.forEach(subPackage => {

                    const res = new Package(this.config, subPackage, this);// parser.parse();
                    this.addPackage(res);

                });

                this.loadFiles();

            } else {

                this.scanDirectory(this.path);

            }

        }

    }

    scanDirectory(directory) {
        fs.readdirSync(directory).forEach(file => {
            file = path.resolve(path.join(directory, file));

            if(util.match(this.config.exclude, file) || !util.match(this.config.include, file)) {
                this.log('skipping file:', file);
                return;
            }

            const stats = fs.lstatSync(file);
            if (stats.isDirectory()) {
                //can now create packages
                const packageJson = path.resolve(path.join(file, 'package.json'));

                if(fs.existsSync(packageJson)) {
                    const pack = new Package(this.config, file, this);

                    this.addPackage(pack);

                } else {
                    this.scanDirectory(file, true);
                }

            } else {
                if (this.config._.loaders.some(loader => util.match(loader.match, file))) {
                        this.addFile(file);

                }
            }
        })
    }

    findPackageForFile(file) {


        let res = file.includes(this.path) ? this : null;

        _.forEach(this.packages, pack => {
            // pack =  this.resources[pack];
            const sub = pack.findPackageForFile(file);
            if(sub) {
                res = sub;
            }
        })

        return res;
    }

    getPackageModules() {
        const mods = Object.values(this.resources).filter(res => res instanceof Module);
        return mods;
    }

    getTypes() {

    }

    getAllModules() {
        let modules = this.getPackageModules();
        _.forEach(this.packages, subPackage => {
            modules = modules.concat(subPackage.getAllModules());
        })

        return modules;
    }

    analyze() {


        return this.doRecursively('analyze')
        .then(res => this.execPluginCallback('onAnalyze'))

        // .then(res => this.getPackageModules().map(mod => mod.map()))
        .then(all => this.map())
        .then(() => this)
        .catch(err => {throw err});

    }


    doRecursively(method) {
        return Promise.all(_.map(this.packages, pack => pack[method]()))
        .then(res => Promise.all(this.getPackageModules().map(mod => mod[method]())))
    }

        /**
     *
     */
    map() {

        this.globals = {};
         const jobs = this.getPackageModules().map(module => {

            return module.map().then(() => {

                _.forEach(module.trigger, trigger => {


                });
            });

        });

        return Promise.all(_.map(this.packages, pack => pack.map()))
        .then(res => Promise.all(jobs))
        .then(() => this.execPluginCallback('onMap'))
        .catch(err => {throw err});


    }

    loadFiles() {

        const files = this.getIncludedFiles(true);
        files.forEach(file => {
            this.addFile(file);
        });

    }

    addFile(file, patch = false) {

        this.log('adding file:', file, 'to:', this.name);

        const res = new Module(this.config, file , this);// parser.parse();
        this.addModule(res, patch);

    }

    addModule(module, patch = false) {

        const resource = module.resource;

        const existingModule = this.resources[resource];

        if (!existingModule) {

            this.resources[resource] = module;

        } else if (patch) {

            existingModule.patch(module);

        } else {

            throw 'module already existing'

        }

    }



    /**
     * attempts to patch the package
     * @param {*} file
     */
    patchFile(file) {
        file = path.resolve(file);

        if (this.getAllModules().some(module => module.path === file)) {
            const pack = this.findPackageForFile(file);
            if (pack) {
                pack.patch(file);
            }
        }
    }

    /**
     * patches this package
     * @param {*} module
     */
    patch(file) {


        this.execPluginCallback('onPatch');

        if (_.isString(file)) {
            this.addFile(file, true);
        } else {
            this.addModule(file, true);
        }

    }

    /**
     * returns a list of files inculed in this package
     * @param {*} excludeSubPackageFiles
     */
    getIncludedFiles(excludeSubPackageFiles = false) {

        const conf = {};

        if(excludeSubPackageFiles ) {

            if (_.isString(this.config.subPackages)) {
                conf.ignore = this.config.subPackages;
            }
        }

        return glob.sync(path.join(this.path, this.config.search), conf);

    }

    /**
     * strips data that is not needed in the UI or elsewhere
     * and is potentially large and/or circular
     */
    serialize() {

        // const types = {};
        // _.forEach(this.resources, resource => {
        //     const type = resource.type;
        //     types[type] = types[type] || {};
        //     types[type][resource.name] = resource.resource;

        // });

        const data = {
            ...this,
            package: this.package && this.package.resource,
            packages: _.mapValues(this.packages, pack => pack.resource),
            // types,
            resources: _.pickBy(_.mapValues(this.resources, resource => resource.resource), res => !res.ignore),
            parent: this.parent && this.parent.resource
        };

        delete data.config;

        this.execPluginCallback('onSerialize', true , data);

        return data;

    }


    getResources() {

        const resources = {};
        resources[this.resource] = this.serialize();

        _.forEach({...this.packages, ...this.resources}, resource => {
            if (resource.getResources) {
                _.merge(resources, resource.getResources());
            } else {
                resources[resource.resource] = resource.serialize();
            }
        });

        return resources;
    }

    getAllTypes() {
        const types = {...this.types};

        _.forEach(this.packages, pack => {
            _.assign(types, pack.types);
        });

        return types;
    }

    write() {

        const data = {
            types: this.getAllTypes(),
            globals: Object.getOwnPropertyNames(global),
            resources: this.getResources(),
            rootPackage: this.resource
        };

        return this.execPluginCallback('onWrite', false, data).then(res => data);
    }


}
