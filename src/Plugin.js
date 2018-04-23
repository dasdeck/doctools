module.exports = class Plugin {

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
    onLoad(desc) {

    }

    /**
     *
     * @param {Object} desc
     */
    onMap(desc) {

    }
}