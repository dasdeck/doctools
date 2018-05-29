/* eslint-env node*/

const util = require('./util');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const mkpath = require('mkpath');
const Cachable = require('./Cachable');

module.exports = class Module {

    constructor(app, file , loader) {

        _.extend(this, Cachable);

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

        this.watch = this.app.config.watch;

        this.load();

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



            this.loader.load(this._raw, this);
            this.app.execPluginCallback('onLoadModule', this, null, true);

            if(this.checkCache()) {
                this.restoreCache();
            }

        } else {
            throw 'no loader!';
        }

    }

    serialize() {

        const data = _.pick(this, [
            'readme',
            'type',
            'name',
            'resource',
            'fileInPackage'
        ]);

        this.app.execPluginCallback('onSerialize', this, data, true);

        return data;
    }

    unwatch() {
        this.watch = false;// && this.watcher.close();
    }

    dispose() {

        this.unwatch();

    }


}
