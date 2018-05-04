const _ = require('lodash');
const fs = require('fs');
const util = require('../util');
class DefaultLoader {

    constructor(config = DefaultLoader.defaultOptions) {
        this.config = config;
        _.defaults(this.config, DefaultLoader.defaultOptions);
    }

    match(file, desc) {
        return this.config.match.bind(this)(file, desc);
    }

    load(file) {

        const desc = {
            script: fs.readFileSync(file, 'utf8'),
            type: this.config.type,
            ...this.config.desc
        };

        return desc;
    }

}

DefaultLoader.defaultOptions = {

    include: '**/*.js',

    exclude: '',

    match(file, desc) {
        return util.match(this.config, file, desc, false);
    },

    type: 'module',

    desc: {}

}

module.exports = DefaultLoader;