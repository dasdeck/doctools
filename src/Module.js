/* eslint-env node*/

const _ = require('lodash');
const utils = require('./util');
const TreeItem = require('./TreeItem');
const fs = require('fs');

class Module extends TreeItem {

    constructor(config, file = config.base, pack = null, loader) {

        super(config, file, pack);

        this.loader = loader;



        this.init();

        // this.runtime = true;

        // if (!this.type) {
        //     throw "your loader should assign a type!"
        // }
        // this.type = this.type || 'module';

        if (this.template && this.type !== 'VueComponent') {
            debugger;
        }
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
            ...this,
            package: this.package.resource
        };

        delete data.config;

        this.execPluginCallback('onSerialize', data, true);

        return data;
    }

    patch() {

        this.init();

        this.execPluginCallback('onPatch', null, true);

    }

}

module.exports = Module;