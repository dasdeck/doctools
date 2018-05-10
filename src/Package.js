const _ = require('lodash');
const util = require('./util');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const TreeItem = require('./TreeItem');
const Module = require('./Module');
const defaultConfig = require('./Config');
const mkpath = require('mkpath');

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
            this.watchAsset(packPath, (w, m) => m.packageJson = JSON.parse(fs.readFileSync(w.file)));
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
                this.log('skipping file:', file);
                return;
            }

            this.log('seeking files in:', file);


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

        this.analyzes = true;

        this.loadAssets();

        return this.doRecursively('execPluginCallback', 'onPrepare')
        .then(res => this.execPluginCallback('onPrepare'))

        .then(res => this.doRecursively('analyze'))
        .then(res => this.execPluginCallback('onAnalyze'))

        .then(res => this.map())

        .then(res => this.execPluginCallback('onLink'))

        .then(() => this.analyzes = false)

        .catch(err => {throw err});

    }



    doRecursivelySync(method, ...args) {
        _.forEach(this.packages, pack => pack[method](...args));
        this.getPackageModules().forEach(mod => mod[method](...args));
    }

    doRecursively(method, ...args) {
        return Promise.all(_.map(this.packages, pack => pack[method](...args)))
        .then(res => Promise.all(this.getPackageModules().map(mod => mod[method](...args))))
    }

    dispose() {
        this.doRecursivelySync('dispose');
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

        if (this.resources[module.resource]) {
            throw 'module uri ' + module.resource + ' already existing'

        }

        this.resources[module.resource] = module;

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

            this.execPluginCallback('onPatch', null, true);
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
            packageJson: this.packageJson,
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

    createMenu(children = this.config.menu, resources = this.getResources()) {
        const res = [];

        return _.reduce(children, (res, child, key) => {

            const entry = {
                ...child,
                label: child.label || key,
            }

            if (_.isFunction(child.items)) {

                entry.items = _.reduce(child.items(this), (res, val) => {
                    res[val.resource] = val.name;
                    return res;
                }, {});

            }

            res[key] = entry;

            return res;

        }, {});

    }



    get() {

        const menu = this.config.menu ? this.createMenu(this.config.menu) : null;

        const data = {
            menu,
            config: _.pick(this.config, ['menus']),
            types: this.getAllTypes(),
            globals: Object.getOwnPropertyNames(global),
            resources: _.mapValues(this.getResources(), res => res.serialize()),
            rootPackage: this.resource
        };

        this.execPluginCallback('onGet', data, true);

        return data;
    }

    write() {

        const data = this.get();

        this.execPluginCallback('onWrite', data, true);

        if (this.config.output) {

            if (this.config.output.split) {

                mkpath.sync(this.config.output.path);

                const p = this.resolvePath(this.config.output.path);
                fs.writeFileSync(path.join(p, '_menu.json'), JSON.stringify(data.menu, null, 2));
                fs.writeFileSync(path.join(p, '_index.json'), JSON.stringify(_.mapValues(data.resources, res => res.name), null, 2));

                _.forEach(data.resources, module => {
                    fs.writeFileSync(path.join(p, `${module.resource}.json`), JSON.stringify(module, null, 2));
                });


            } else {

                const p = this.config.output.path || this.config.output;
                fs.writeFileSync(this.resolvePath(p), JSON.stringify(data, null, 2));

            }
        }

        return Promise.resolve(data);
    }


}
