/* eslint-env node*/

const _ = require('lodash');
const utils = require('./util');
const TreeItem = require('./TreeItem');
const fs = require('fs');

class Module extends TreeItem {

    constructor(config, file = config.base, pack = null, loader) {

        super(config, file, pack);

        this.loader = loader;

        this.load();

    }

    load() {

        super.load();
    }

    analyze() {

        return this.execPluginCallback('onAnalyze');

    }

    /**
     * applys custom mapping to module types
     */
    map() {
       return this.execPluginCallback('onMap');
    }

    /**
     * @override
     */
    serialize() {

        const data = {
            ...super.serialize(),
            package: this.package.resource
        };

        this.execPluginCallback('onSerialize', data, true);

        return data;
    }

    patch() {

        super.load();

        this.execPluginCallback('onPatch', null, true);

    }

}

module.exports = Module;