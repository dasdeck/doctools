const _ = require('lodash');
const fs = require('fs');
const util = require('../util');
class MarkdownLoader {

    constructor(config = MarkdownLoader.defaultOptions) {
        this.config = config;
        _.defaults(this.config, MarkdownLoader.defaultOptions);
    }

    match(file, desc) {
        return this.config.match.bind(this)(file, desc);
    }

    load(file, desc) {

        // let readme = fs.readFileSync(file, 'utf8');

        desc.type = 'markdown';
        desc.watchAsset(file, 'readme');

    }

}

MarkdownLoader.defaultOptions = {

    include: '**/*.md',

    exclude: '',

    match(file, desc) {
        return util.match(this.config, file, desc, false);
    },
}

module.exports = MarkdownLoader;