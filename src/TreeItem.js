
const _ = require('lodash');
const {EventEmitter} = require('events');
const fs = require('fs');
const path = require('path');
const util = require('./util');
const chokidar = require('chokidar');

/**
 * extracting some commong basics for the parsers
 */
module.exports = class TreeItem extends EventEmitter {

    constructor(app, file = config.base, parent = null) {

        super();

        this._assets = {};

        this.app = app;
        this.config = app.config;

        this.package = parent;

        this.path = file;
        this.fileInPackage = this.path.replace(this.config.base, '.');
        if (this.fileInPackage === '.') {
            this.fileInPackage += '/';
        }
        this.name = this.path.split('/').pop().split('.').shift();
        this.resource = this.config.getResourceUri(this);

        if (this.config.dev || this.config.log) {
            this.log = console.log;
            const logDir = path.join(this.config.base, 'log');
            try {fs.mkdirSync(logDir);} catch(e) {};
            this.logFile = (name, data) => fs.writeFileSync(path.join(logDir, name), _.isString(data) ? data : JSON.stringify(data, null, 2));
        } else {
            this.logFile = this.log = x => x;
        }
    }

    load() {

        this.resources = {};

        if (this.loader) {
            const desc = this.loader.load(this.path, this);
        }

        this.execPluginCallback('onLoad', {}, true);
    }

    serialize() {

        return _.pick(this, [
            'readme',
            'assets',
            // 'script',
            'path',
            'type',
            'name',
            'resource',
            'fileInPackage']
        )
    }

    watchAsset(file, targetKey, init = true, patch = false) {

        if (!this._assets[file]) {

            const watcher = {
                file,
                module: this,
                close() {
                    this.watcher.close();
                },
                change(sendChange = true) {

                    const module = this.module;

                    if (_.isString(targetKey)) {

                        const newValue = fs.readFileSync(file, 'utf8');

                        const currentValue = _.get(module, targetKey);

                        if (newValue !== currentValue) {

                            _.set(module, targetKey, newValue);

                        } else {
                            debugger;
                        }
                    } else if (_.isFunction(targetKey)) {
                        targetKey(this, module);
                    }

                    if (sendChange) {
                        module.log('asset changed', file);
                        if (patch) {
                            module.patch();
                        }
                        module.getRootPackage().emit('change');
                    }

                }
            };

            watcher.watcher = chokidar.watch(file);
            watcher.watcher.on('change', () => watcher.change());

            if (init) {
                watcher.change(false);
            }

            this._assets[file] = watcher;
        }
    }

    unwatchAsset(file) {
        const asset = this._assets[file];
        if (asset) {
            delete this._assets[file];
            asset.close();
        }
    }

    resolvePath(dir) {
        return path.isAbsolute(dir) ? dir : path.join(this.config.base, dir);

    }

    dispose() {

        _.forEach(this._assets, asset => asset.close())
        this.execPluginCallback('onDispose', {}, true);
    }

    getRootPackage() {
        if (this.package) {
            return this.package.getRootPackage();
        } else {
            return this;
        }
    }

    isRootPackage() {
        return this === this.getRootPackage() && this.package === null;
    }

    execPluginCallback(name, data = null, sync = false) {

        if (!this.config._) {
            // debugger;
        }

        const jobs = this.config._.plugins.map(plugin => {
            return () => plugin.matchesType(this, name) && plugin[name] && plugin[name](this, data) || Promise.resolve();
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

        // return Promise.all(jobs);
    }

    analyze() {
        throw 'implement';
    }

};