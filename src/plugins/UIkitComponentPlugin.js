const ComponentMapper = require('./ComponentMapper');

module.exports = class UIkitComponentPlugin extends ComponentMapper {

    matchesType(desc) {

        return desc.type === 'UIkitComponent';
    }

};