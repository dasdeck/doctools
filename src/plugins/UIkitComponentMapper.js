const ComponentMapper = require('./ComponentMapper');
const _ = require('lodash');
const {hyphenate} = require('../util');
module.exports = class UIkitComponentMapper extends ComponentMapper {

    /**
     *
     * @inheritDoc
     */
    onMapModule(desc) {

        if (desc.type !== 'UIkitComponent') {
            return;
        }
        super.onMapModule(desc);

        _.forEach(desc.component, (data, type) => {
            _.forEach(data, (value, key) => {
                if (value.name) {
                    value.name = hyphenate(value.name);
                }
            });
        })

    }

};