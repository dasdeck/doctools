const _ = require('lodash');
const jsdoc = require('jsdoc-api');
const Plugin = require('../Plugin');
const util = require('../util');
const fs = require('fs');

class PackageMapper extends Plugin {

    constructor(config = PackageMapper.defaultConfig) {
        super();
        this.config = config;
    }

    /**
     *
     * @param {Object} desc
     * @returns {Boolean}
     */
    matchesType(desc, call) {
        return desc.type === 'package';
    }

    onAnalyze(desc) {

    }

    onDispose() {
    }

    onSerialize(desc, data) {
        data.module = _.pick(desc.module, ['global', 'description', 'type']);
    }

    onPrepare(desc) {
    }

    onPatch(desc) {
    }


    /**
     * maps the jsdoc list to a sorted structure
     * @param {*} all
     * @param {*} config
     */
    onMap(desc) {

        debugger;

        const packages = _.sortBy(_.filter(desc.app.resource, res => res.type === 'package'), desc => -desc.path.length);

        const dir = path.dirname(desc.path);
        desc.packages =  &&  res.path.includes(dir));
    }

};

PackageMapper.defaultConfig = {
    getAssets(desc) {
        return {readme: path.join(path.dirname(desc.path), 'README.md')};
    }
}

module.exports = PackageMapper;