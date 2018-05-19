/* eslint-env node */

const fs = require('fs');
const _ = require('lodash');

const path = require('path');

const util = require('./util');
// const {getTestCodes} = require('./testParser');

const Config = require('./Config');

const DocTools = require('./Doctools');


/**
 * @file
 * @example
```js
//import parser
import parser from 'doctools';

//use on a single file
parser.parse("path/to/a/file/or/directory"); //shorthand for parser.parse({base: "path/to/a/file/or/directory"})

...

//pass a config
parser.parse({
    base: __dirname,
    ...
});

...

//or use default config
parser.parse();
```
 */

module.exports = {

    /**
     * Parses the data defined in config and returns an object containing the parsed structure
     * @param {String|DoctoolsConfig} [config = {}] - filePath or config hash
     * @returns {Object} the parsed structure
     */
    parse(config = {}) {

        if (typeof config === 'string') {
            config = {base: config};
        }

        config = new Config(config);

        const app = new DocTools(config);

        // app.parse(config);
//
        return app;

    },

};
