const ComponentMapper = require('./ComponentMapper');

module.exports = class UIkitComponentMapper extends ComponentMapper {


    onConstruct(desc) {
        const type = 'UIkitComponent';
        if (desc.script && desc.script.includes(type)) {
            desc.type = type;
            desc.runtime = true;
        }
    }

};