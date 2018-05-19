const _ = require('lodash');
const Plugin = require('../Plugin');

module.exports = class TypeMapper extends Plugin {

    constructor() {
        super();
        this.nodeGlobals = Object.getOwnPropertyNames(global);
    }

    onGet(app, data) {

        data.nodeGlobals = this.nodeGlobals;

        data.types = _.reduce(app.resources, (types, res) => {

            if (res.module) {

                _.forEach(res.module.types, (source, name) => {

                    if(types[name]) {
                        debugger;
                    }
                    types[name] = source;

                })
            }

            return types;

        }, {});

    }

    getAllTypes(app) {

    }

}