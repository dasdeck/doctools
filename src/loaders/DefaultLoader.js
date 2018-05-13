const _ = require('lodash');
const fs = require('fs');
const util = require('../util');
const Loader = require('../Loader');
class DefaultLoader extends Loader {

    constructor(config = DefaultLoader.defaultOptions) {
        super();

        this.config = config;
        _.defaults(this.config, DefaultLoader.defaultOptions);
    }

    match(file) {

        return util.match(this.config, file);
    }

    load(file, desc) {

        desc.watchAsset(file, this.config.member);

        _.assign(desc, {
            type: this.config.type,
            ...this.config.desc
        });

    }

}

DefaultLoader.defaultOptions = {

    include: '**/*.js',

    member: 'script',

    type: 'module',

    desc: {}

}

module.exports = DefaultLoader;