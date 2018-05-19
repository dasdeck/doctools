/* eslint-env node*/

const util = require('./util');
const fs = require('fs');
const chokidar = require('chokidar');
const path = require('path');
const _ = require('lodash');
const mkpath = require('mkpath');
const Chachable = require('./Chachable');

module.exports = class Module {

    constructor(app, file , loader) {


        _.extend(this, Chachable);

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

    getChacheName() {
        return this.resource;
    }

    getHash() {
        return this._hash;
    }

    load() {

        if (this.loader) {
            this._raw = fs.readFileSync(this.path, 'utf8');
            this._hash = util.hash(this._raw);

            if(this.checkCache()) {

                this.restoreCache();

            } else {
                this.loader.load(this._raw, this);
                this.app.execPluginCallback('onLoadModule', this, null, true);
            }

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
