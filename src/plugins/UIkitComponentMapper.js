const ComponentMapper = require('./ComponentMapper');

module.exports = class UIkitComponentMapper extends ComponentMapper {


    onConstruct(desc) {
        if (desc.script && desc.script.includes('UIkitComponent')) {
            desc.type = 'UIkitComponent';
            desc.runtime = true;
        }
    }

};