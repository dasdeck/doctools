const _ = require('lodash');
const Plugin = require('../Plugin');

module.exports = class TypeMapper extends Plugin {

    constructor() {
        super();
        this.nodeGlobals = Object.getOwnPropertyNames(global);
    }

    /**
     * maps all found types to a global data member
     * @inheritDoc
     * @param {DocTools} app
     * @param {Object} data
     */
    onGet(app, data) {

        data.nodeGlobals = this.nodeGlobals;

        data.types = _.reduce(app.resources, (types, res) => {

            if (res.module) {

                _.forEach(res.module.types, (source, name) => {

                    if (types[name]) {
                        throw 'type already defined';
                    }
                    types[name] = source;

                });
            }

            return types;

        }, {});

    }

};