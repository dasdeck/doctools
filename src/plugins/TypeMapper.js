const _ = require('lodash');
// const jsdoc = require('jsdoc-api');
const Plugin = require('../Plugin');
// const util = require('../util');
// const fs = require('fs');
// const path = require('path');

module.exports = class TypeMapper extends Plugin {

    onLink(app) {

    }

    onGet(app, data) {

        data.nodeGlobals = Object.getOwnPropertyNames(global);

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