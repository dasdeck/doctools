const {EventEmitter} = require('events');
const _ = require('lodash');

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

    onWriteCache(app) {}

    onWriteModuleCache(desc) {}
    /**
     *
     * @param {Object} desc
     */
    onMap(app) {
        _.forEach(app.resources, res => this.onMapModule(res));
    }

    onMapModule(desc) {}

    //single module!
    onLoadModule(desc) {}

    //single module
    onSerialize(desc) {}

    //app
    onGet(app) {}

    onWrite(app) {}

    onDispose() {}

};