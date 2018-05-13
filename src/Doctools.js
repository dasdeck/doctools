const util = require('./util');
const _ = require('lodash');
const glob = require('glob');
const {EventEmitter} = require('events');
module.exports = class DocTools extends EventEmitter {

    constructor() {

        super();
        this.resources = {};

    }

    log(...args) { console.log(...args); }

    logFile() {}

    parse(config = {}) {
        this.config = config;

        this.config._.plugins.forEach(plugin => plugin.app = this);

        this.execPluginCallback('onLoad', {}, true);

        // this.scanFile(this.config.base);
        const contentFiles = `@(src|packages)/**/*.@(js|md|vue|json)`;
        // const content = __dirname + `/../examples/@(package.json|${contentFiles})`
        const content = __dirname + `/../examples/${contentFiles}`
        // const pack = '/@()'

        const files = [...glob.sync(content),  __dirname + `/../examples/package.json`];

        // debugger;
        files.forEach(file => {
            this.loadFile(file);
            // debugger
        })


    }

    getResourceByFile(file) {
        return _.find(this.resources, res => res.path === file);
    }

    analyze() {
        this.analyzes = true;

        this.execPluginCallback('onPrepare', this);

        return this.execPluginCallback('onAnalyze', this, null, false)
        .then(() => {
            this.execPluginCallback('onMap', this);
            this.execPluginCallback('onLink', this);
            this.analyzes = false;
            return this;
        });

    }


    get() {
        const data = {};
        return data;
    }

    write() {
        debugger;
    }


    execPluginCallback(name, module = this, data = null, sync = true) {

        if (Array.isArray(module)) {
            if (sync) {
                module.forEach(module =>
                    this.execPluginCallback(name, module, data, sync));
            } else {
                return Promise.all(module.map(module =>
                    this.execPluginCallback(name, module, data, sync)));
            }
        } else {

            if (!this.config._) {
                debugger;
            }

            const jobs = this.config._.plugins.map(plugin => {
                return () => plugin[name] && plugin[name](module, data) || Promise.resolve();
            });

            if (sync) {
                jobs.forEach(job => {
                    job();
                });
            } else {
                return jobs.reduce(function(p, fn) {
                    return p = p.then(fn);
                }, Promise.resolve());

            }

        }

    }

    scanFile(file) {

        if (!util.match(this.config, file)) {
            // this.config.log('skipping file:', file);
            return;
        }

        // pack.log('seeking files in:', file);

        const module = this.loadFile(file);

        if (module) {

            // pack && pack.addChild(module);

        }


        if(fs.lstatSync(file).isDirectory()) {

            this.scanDirectory(file);

        }

        return module;

    }

    scanDirectory(directory) {

        fs.readdirSync(directory).forEach(file => {

            file = path.resolve(path.join(directory, file));

            this.scanFile(file);

        })

    }

    loadFile(file) {

        const existing = this.getResourceByFile(file);

        if (existing) {

            throw file + ' already loaded!';
        }

        for(const loader of this.config._.loaders) {

            if (loader.match(file)) {

                const module = loader.createModule && loader.createModule(this, file, null)
                    || new Module(this, file , pack, loader);


                if (this.resources[module.resource]) {
                    throw 'module resource uri ' + module.resource + ' already existing'
                }

                this.resources[module.resource] = module;

                return module;

            }
        }
    }


}