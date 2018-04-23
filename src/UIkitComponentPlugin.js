const ComponentPlugin = require('./ComponentPlugin');

module.exports = class UIkitComponentPlugin extends ComponentPlugin {

    matchesType(desc) {

        return desc.type === 'UIkitComponent';
    }

    onMap(desc) {

        this.map(desc);

    }

};