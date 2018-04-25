const {EventEmitter} = require('events');

module.exports = class Plugin extends EventEmitter {

    /**
     *
     * @param {Object} desc
     * @returns {Boolean}
     */
    matchesType(desc) {
        throw 'unimplemented';
    }

    /**
     *
     * @param {Object} desc
     */
    onConstruct(desc) {}

    onAnalyze(desc) {}

    /**
     *
     * @param {Object} desc
     */
    onMap(desc) {}

    onPatch(desc) {}

    onSerialize(desc) {}

};