const ComponentMapper = require('./ComponentMapper');

module.exports = class UIkitComponentMapper extends ComponentMapper {


    onLoad(desc) {
        const type = 'UIkitComponent';
        if (desc.script && desc.script.includes(type)) {
            desc.type = type;
            desc.runtime = true;
        }
    }

};