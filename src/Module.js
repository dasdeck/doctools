/* eslint-env node*/

const _ = require('lodash');
const utils = require('./util');
const TreeItem = require('./TreeItem');
const fs = require('fs');

class Module extends TreeItem {

    constructor(config, file = config.base, pack = null) {

        super(config, file, pack);

        this.init();

        this.type = this.type || 'module';

        if (!this.script) {
            this.script = fs.readFileSync(this.path, 'utf8');
        }




    }

    analyze() {

        return this.execPluginCallback('onAnalyze')
            // .then(res => this.map());

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
        return {...this, config: undefined, runtime: undefined, package: this.package.resource, ...this.data};
    }

    patch(module) {

        this.execPluginCallback('onPatch');

        _.assign(this, module);
    }

}

module.exports = Module;