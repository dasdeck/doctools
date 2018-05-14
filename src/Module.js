/* eslint-env node*/

const _ = require('lodash');
const utils = require('./util');
const TreeItem = require('./TreeItem');
const fs = require('fs');

class Module extends TreeItem {

    constructor(app, file = config.base, pack = null, loader) {

        super(app, file, pack);

        this.loader = loader;

        this.load();

    }

    load() {

        super.load();
    }


    patch() {

        super.load();

        this.app.execPluginCallback('onPatch', this, null, true);

    }

}

module.exports = Module;