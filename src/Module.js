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

        if (this.template && this.type !== 'VueComponent') {
            debugger;
        }
    }

    analyze() {

        try {
            if (!this.readme) {
                this.readme = fs.readFileSync(this.path + '.md', 'utf8');
            }
        } catch (e) {

        }
        return this.execPluginCallback('onAnalyze');
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

        const data = {
            ...this,
            package: this.package.resource
        };

        delete data.config;

        this.execPluginCallback('onSerialize', data, true);

        return data;
    }

    patch(module) {

        this.execPluginCallback('onPatch');

        _.assign(this, module);
    }

}

module.exports = Module;