const _ = require('lodash');
const {EventEmitter} = require('events');
const fs = require('fs');
const path = require('path');
const util = require('./util');
/**
 * extracting some commong basics for the parsers
 */
module.exports = class TreeItem extends EventEmitter {

    constructor(config, file = config.base, parent = null) {

        super();

        this._assets = {};

        this.config = config;

        this.package = parent;

        this.path = file;
        this.fileInPackage = this.path.replace(this.config.base, '.');
        if (this.fileInPackage === '.') {
            this.fileInPackage += '/';
        }
        this.name = this.path.split('/').pop().split('.').shift();
        this.resource = this.config.getResourceName(this);

        if (config.dev || config.log) {
            this.log = console.log;
            const logDir = path.join(this.config.base, 'log');
            try {fs.mkdirSync(logDir);} catch(e) {};
            this.logFile = (name, data) => fs.writeFileSync(path.join(logDir, name), _.isString(data) ? data : JSON.stringify(data, null, 2));
        } else {
            this.logFile = this.log = x => x;
        }
    }

    load() {

        if (this.loader) {

            const desc = this.loader.load(this.path);
            _.assign(this, desc);

        }

        this.execPluginCallback('onConstruct', {}, true);
    }

    serialize() {

        return _.pick(this, [
            'readme',
            'script',
            'path',
            'type',
            'name',
            'resource',
            'fileInPackage']
        )
    }

    watchAsset(file, targetKey, transform = file => fs.readFileSync(file, 'utf8')) {

        if (!this._assets[file]) {

            let init = true;
            const load = (type, filename) => {

                const newValue = transform(file);

                const currentValue = _.get(this, targetKey);

                if (newValue !== currentValue) {
                    !init && this.log('asset changed', targetKey);

                    _.set(this, targetKey, newValue);

                    !init && this.getRootPackage().emit('change');
                }
            };

            load(null, file, true);

            init = false;
            const watcher = fs.watch(file, {}, load);

            // this.log('watch', file);

            this._assets[file] = {
                watcher,
                file,
                close() {
                    this.watcher.close();
                    // console.log('watcher closed:', this.file);
                }
            };
        }
    }

    unwatchAsset(file) {
        const asset = this._assets[file];
        if (asset) {
            delete this._assets[file];
            asset.close();
        }
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
            return () => plugin.matchesType(this) && plugin[name] && plugin[name](this, data) || Promise.resolve();
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