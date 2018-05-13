const _ = require('lodash');
const fs = require('fs');
const util = require('../util');
const Loader = require('../Loader');

class MarkdownLoader extends Loader {

    constructor(config = MarkdownLoader.defaultOptions) {
        super();
        this.config = config;
        _.defaults(this.config, MarkdownLoader.defaultOptions);
    }

    match(file) {
        return util.match(this.config, file);
    }

    load(file, desc) {

        desc.type = 'markdown';
        desc.watchAsset(file, 'readme');

    }

}

MarkdownLoader.defaultOptions = {

    include: '**/*.md',

}

module.exports = MarkdownLoader;