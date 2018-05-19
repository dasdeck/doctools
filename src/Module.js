/* eslint-env node*/

const utils = require('./util');
const fs = require('fs');
const chokidar = require('chokidar');
const path = require('path');
const _ = require('lodash');

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

    load() {

        if (this.loader) {
            this._raw = fs.readFileSync(this.path, 'utf8');
            this.loader.load(this._raw, this);
            this.app.execPluginCallback('onLoadModule', this, null, true);
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
