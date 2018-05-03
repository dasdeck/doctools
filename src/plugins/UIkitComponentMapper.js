const ComponentMapper = require('./ComponentMapper');

module.exports = class UIkitComponentMapper extends ComponentMapper {

    matchesType(desc) {

        return desc.type === 'UIkitComponent';
    }

    onAnalyze(desc) {
        desc.runtime = true;
    }

};