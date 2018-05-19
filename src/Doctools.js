const util = require('./util');
const _ = require('lodash');
const glob = require('glob');
const path = require('path');
const Config = require('./Config');

const chokidar = require('chokidar');

const fs = require('fs');
const {EventEmitter} = require('events');
const mkpath = require('mkpath');

module.exports = class DocTools extends EventEmitter {

    constructor(config = new Config()) {

        super();

        this.config = config.prepareConfig(this);

        if (this.config.file) {

            this.log('config file used: ', this.config.file);
        }

        mkpath.sync(this.getCacheDir());

        this.execPluginCallback('onLoad', this, true);

        this.resources = {};

        this.scanFile(this.config.base);

        if (this.config.watch && fs.lstatSync(this.config.base).isDirectory()) {
            this.watcher = chokidar.watch(this.config.base);
            this.watcher.on('add', file => {
                if (!this.getResourceByFile(file) && util.match(this.config, file, {matchBase: this.config.base})) {
                    this.scanFile(file);
                    this.emit('change', {'add': file});
                }
            });

            this.watcher.on('unlink', file => {

                const res = this.getResourceByFile(file);
                if (res) {
                    res.dispose();
                    delete this.resources[res.resource];
                    this.emit('change', {'remove': file});

                }
            })
        }

    }

    log(...args) { if (this.config.dev) console.log(...args); }

    logFile() {}

    dispose() {

        this.watcher && this.watcher.close();
        _.forEach(this.resources, res => res.dispose());
        this.execPluginCallback('onDispose', this);

    }

    getResourceByFile(file) {

        return _.find(this.resources, res => res.path === file);

    }

    getHash() {

    }

    analyze() {

        if (!this.analyzes) {

            this.log('starting analyze');

            this.execPluginCallback('onPrepare', this);

            this.analyzes = this.execPluginCallback('onAnalyze', this, null, false)
            .then(() => {
                this.execPluginCallback('onMap', this);
                this.execPluginCallback('onLink', this);
                this.analyzes = null;
                this.log('done analyze');

                return this;
            });

        } else {
            this.log('waiting for running analyze');

        }

        return this.analyzes;

    }

    get() {

        const data = {
            resources: _.mapValues(this.resources, res => res.serialize())
        };

        this.execPluginCallback('onGet', this, data);

        return data;

    }

    write() {

        const data = this.get();

        this.execPluginCallback('onWrite', this, data, true);

        if (this.config.output) {

            if (this.config.output.split === true) {

                mkpath.sync(this.config.output.path);

                const p = this.resolvePath(this.config.output.path);
                // fs.writeFileSync(path.join(p, '_menu.json'), JSON.stringify(data.menu, null, 2));
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

    resolvePath(dir) {
        return path.isAbsolute(dir) ? dir : path.join(this.config.base, dir);
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

            if (sync === true) {
                jobs.forEach(job => {
                    job();
                });
            } else if (sync === 'serial') {
                return jobs.reduce(function(p, fn) {
                    return p = p.then(fn);
                }, Promise.resolve());

            } else {
                return Promise.all(jobs.map(job => job()));
            }

        }

    }

    scanFile(file) {

        // debugger
        if (!util.match(this.config, file, {matchBase: this.config.base})) {
            this.log('skipping file:', file);
            return;
        }

        this.log('seeking files in:', file);

        this.loadFile(file);

        if (fs.lstatSync(file).isDirectory()) {

            this.scanDirectory(file);

        }

    }

    scanDirectory(directory) {

        fs.readdirSync(directory).forEach(file => {

            file = path.resolve(path.join(directory, file));

            this.scanFile(file);

        })

    }

    getCacheDir() {
        return path.join(this.config.base, '.doctools','_cache');
    }

    loadFile(file) {

        const existing = this.getResourceByFile(file);

        if (existing) {

            throw file + ' already loaded!';
        }

        for(const loader of this.config._.loaders) {

            if (loader.match(file)) {

                const module = loader.createModule && loader.createModule(this, file)
                    || new Module(this, file, loader);


                if (this.resources[module.resource]) {
                    throw 'module resource uri ' + module.resource + ' already existing'
                }

                this.resources[module.resource] = module;

                return module;

            }
        }
    }


}