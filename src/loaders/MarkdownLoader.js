const _ = require('lodash');
const fs = require('fs');
const util = require('../util');
const DefaultLoader = require('./DefaultLoader');

class MarkdownLoader extends DefaultLoader {

    constructor(config = MarkdownLoader.defaultOptions) {
        super(config);
        _.defaults(this.config, MarkdownLoader.defaultOptions);
    }

}

MarkdownLoader.defaultOptions = {

    include: '**/*.md',
    type: 'markdown',
    member: 'readme'

}

module.exports = MarkdownLoader;