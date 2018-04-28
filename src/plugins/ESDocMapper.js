
const _ = require('lodash');
const jsdoc = require('jsdoc-api');
const Plugin = require('./Plugin');
const util = require('../util');
const esdoc = require('esdoc');

module.exports = class EEDocMapper extends Plugin {

    /**
     *
     * @param {Object} desc
     * @returns {Boolean}
     */
    matchesType(desc) {
        return desc.type !== 'package';
    }

    onAnalyze(desc) {

        const babylon = require('babylon')
        debugger
        const ast = babylon.parse(desc.script, {});
        const parser = require('esdoc/out/src/Parser/ESParser');
        const res = parser.default.parse(desc.path);
        debugger

        esdoc.default.generate({});
    }

    onSerialize(desc, data) {
        delete data.esdoc;
    }

    onPatch(desc) {
        // desc.log('jsdoc cleared', desc.name, !!desc.all);
        // delete desc.jsdoc;
        // delete desc.module;
    }

    /**
     * maps the jsdoc list to a sorted structure
     * @param {*} all
     * @param {*} config
     */
    onMap(desc) {

    }



};