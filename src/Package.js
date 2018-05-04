const _ = require('lodash');
const util = require('./util');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const TreeItem = require('./TreeItem');
const Module = require('./Module');
const defaultConfig = require('./Config');
/**
 * the Package parser
 */
module.exports = class Package extends TreeItem {

    constructor(config = defaultConfig, file = config.base, parent = null) {


        super(config, file, parent);

        this.type = 'package';

        this.load();


    }

    load() {
        this.resources = {};
        super.load();
        this.scanDirectory(this.path);
    }



    getPackageJsonPath() {
        return path.resolve(path.join(this.path, 'package.json'));
    }

    loadAssets() {

        const packPath = this.getPackageJsonPath();
        if (fs.existsSync(packPath)) {
            this.watchAsset(packPath, 'packageJson');
        }

        const mdPath = path.join(this.path, 'README.md');
        if (fs.existsSync(mdPath)) {
            this.watchAsset(mdPath, 'readme');
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

    scanDirectory(directory) {
        fs.readdirSync(directory).forEach(file => {
            file = path.resolve(path.join(directory, file));

            if (!util.match(this.config, file, this)) {
                // this.log('skipping file:', file);
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

                this.config._.loaders.some(loader => {

                    if (util.match(loader.match.bind(loader), file, this)) {
                        this.addFileToPackage(file, loader);
                        return true;
                    }

                });
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

    getAllModules() {
        let modules = this.getPackageModules();
        _.forEach(this.packages, subPackage => {
            modules = modules.concat(subPackage.getAllModules());
        })

        return modules;
    }

    analyze() {

        this.loadAssets();

        return this.doRecursively('execPluginCallback', 'onPrepare')
        .then(res => this.execPluginCallback('onPrepare'))

        .then(res => this.doRecursively('analyze'))
        .then(res => this.execPluginCallback('onAnalyze'))

        .then(res => this.map())

        .then(() => this)

        .catch(err => {throw err});

    }



    doRecursively(method, ...args) {
        return Promise.all(_.map(this.packages, pack => pack[method](...args)))
        .then(res => Promise.all(this.getPackageModules().map(mod => mod[method](...args))))
    }

    dispose() {
        this.doRecursively('dispose');
        super.dispose();
    }
        /**
     *
     */
    map() {

        this.globals = {};

        return Promise.all(_.map(this.packages, pack => pack.map()))
        .then(res => Promise.all(this.getPackageModules().map(module => module.map())))
        .then(() => this.execPluginCallback('onMap'))
        .catch(err => {throw err});


    }



    addFileToPackage(file, loader) {

        const existingResource = this.getResourceByFile(file);

        if (existingResource) {

            throw 'file already added';
        }

        // this.log('adding file:', file, 'to:', this.name);

        const module = new Module(this.config, file , this, loader);// parser.parse();

        this.resources[module.resource] = module;

    }

    addModule(module) {

        const resource = module.resource;

        if (this.resources[resource]) {
            throw 'module uri already existing'

        }

    }


    getResourceByFile(file) {
        return _.find(this.getResources(), res => res.path === file);
    }



    /**
     * attempts to patch the package
     * @param {*} file
     */
    patchFile(file) {
        file = path.resolve(file);

        const existingResource = this.getResourceByFile(file);
        if (existingResource) {

            this.execPluginCallback('onPatch');
            existingResource.patch();
        } else {
            throw 'can only patch already existing files';
        }

    }

    /**
     * strips data that is not needed in the UI or elsewhere
     * and is potentially large and/or circular
     */
    serialize() {


        const data = {
            ...super.serialize(),
            package: this.package && this.package.resource,
            packages: _.mapValues(this.packages, pack => pack.resource),
            // types,
            resources: _.pickBy(_.mapValues(this.resources, resource => resource.resource), res => !res.ignore),
            parent: this.parent && this.parent.resource
        };


        this.execPluginCallback('onSerialize', data, true );

        return data;

    }

    /**
     * gets a flat hash of all resources, including subpackages
     * @param {Boolean} serialize - whether to provide seriali
     */
    getResources() {

        const resources = {};
        resources[this.resource] = this;

        _.forEach({...this.packages, ...this.resources}, resource => {
            if (resource.getResources) {
                _.merge(resources, resource.getResources());
            } else {
                resources[resource.resource] = resource;
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

    createMenu(children = this.config.menu) {
        const res = [];

        return _.map(children, child => {

            if (child.match) {

                return {
                    ...child,
                    match: null,
                    items: _.map(_.filter(this.getResources(), res => {
                        return util.match(child.match, res.path, res, false);
                    }), res => res.resource)
                }
            }

        });
    }



    get() {
        const menu = this.config.menu ? this.createMenu() : null;

        const data = {
            config: _.pick(this.config, ['menus']),
            menu,
            types: this.getAllTypes(),
            globals: Object.getOwnPropertyNames(global),
            resources: _.mapValues(this.getResources(), res => res.serialize()),
            rootPackage: this.resource
        };

        this.execPluginCallback('onGet', data, true);

        // util.isCyclic(data);

        return Promise.resolve(data);
    }

    write() {

        const data = this.get();

        this.execPluginCallback('onWrite', data, true);
        return Promise.resolve(data);
    }


}
