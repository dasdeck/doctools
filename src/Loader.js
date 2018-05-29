const Module = require('./Module');

/**
 * base class for loaders
 * @abstract
 */
module.exports = class Loader {

    /**
     *
     * @param {DocTools} app
     * @param {String} file
     */
    createModule(app, file) {
        return new Module(app, file, this);
    }

    /**
     *
     * @param {String} source
     * @param {Module} desc
     */
    load(source, desc) {

    }

};