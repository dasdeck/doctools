/* eslint-env node*/

const utils = require('./util');
const fs = require('fs');
const chokidar = require('chokidar');
const path = require('path');
const _ = require('lodash');
const mkpath = require('mkpath');
const xxhash = require('xxhash');
module.exports = class Module {

    constructor(app, file , loader) {

        this.app = app;

        this.config = app.config;

        this.resources = {};

        this.path = path.resolve(file);

        this.fileInPackage = this.path.replace(this.config.base, '.');

        if (this.fileInPackage === '.') {
            this.fileInPackage += '/';
        }

        this.name = this.path.split('/').pop().split('.').shift();

        this.resource = this.config.getResourceUri(this);
        this.loader = loader;


        if (this.app.config.watch) {

            this.watcher = chokidar.watch(this.path);
            this.watcher.on('change', res => {
                this.load();
                this.app.emit('change', this);
            });
        }

        this.load();

    }

    getState() {
        return _.omit(this, ['app', 'config', 'loader', 'watcher']);
    }

    setState(state) {
        _.assign(this, state);
    }

    getCacheFile() {
        return path.join(this.app.getCacheDir(), this.resource, this.getHash() + '.json');
    }

    getCacheDir() {
        return path.dirname(this.getCacheFile());
    }

    storeCache() {
        mkpath.sync(this.getCacheDir());
        fs.writeFileSync(this.getCacheFile(), JSON.stringify(this.getState(), null, 2));
    }

    checkCache() {
        return fs.existsSync(this.getCacheFile()) || fs.rmdirSync(this.getCacheDir());
    }

    restoreCache() {
        const state = JSON.parse(fs.readFileSync(this.getCacheFile(), 'utf8'));
        this.setState(state);
    }

    getHash() {
        return xxhash.hash(Buffer.from(this._raw, 'utf8'), 0xCAFEBABE);
    }

    load() {

        if (this.loader) {
            this._raw = fs.readFileSync(this.path, 'utf8');
            this.loader.load(this._raw, this);
            this.app.execPluginCallback('onLoadModule', this, null, true);
            this.storeCache();
        } else {
            throw 'no loader!';
        }

    }

    serialize() {

        const data = _.pick(this, [
            'readme',
            'package',
            'type',
            'name',
            'resource',
            'fileInPackage'
        ]);

        this.app.execPluginCallback('onSerialize', this, data, true);

        return data;
    }

    unwatch() {
        this.watcher && this.watcher.close();
    }

    dispose() {

        this.unwatch();

    }


}
