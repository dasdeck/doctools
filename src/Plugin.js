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
    onLoad(app) {}


    onPrepare(app) {}

    onAnalyze(app) {}

    /**
     *
     * @param {Object} desc
     */
    onMap(app) {}

    //single module!
    onPatch(desc) {}

    //single module
    onSerialize(desc) {}

    //app
    onGet(app) {}

    onWrite(app) {}

    onDispose() {}

};