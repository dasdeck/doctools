const ComponentMapper = require('./ComponentMapper');

module.exports = class UIkitComponentMapper extends ComponentMapper {


    onMapModule(desc) {

        if(desc.type !== 'UIkitComponent') {
            return;
        }
        super.onMapModule(desc);

    }

};