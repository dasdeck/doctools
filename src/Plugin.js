const {EventEmitter} = require('events');

module.exports = class Plugin extends EventEmitter {

    constructor() {

        super();
        this.setMaxListeners(0);

    }

    /**
     *
     * @param {Object} desc
     * @returns {Boolean}
     */
    matchesType(desc) {
        return true;
    }

    /**
     *
     * @param {Object} desc
     */
    onConstruct(desc) {}

    onPrepare(desc) {}

    onAnalyze(desc) {}

    /**
     *
     * @param {Object} desc
     */
    onMap(desc) {}

    onPatch(desc) {}

    onSerialize(desc) {}

    onGet(data) {}

    onWrite(data) {}

    onDispose() {}

};