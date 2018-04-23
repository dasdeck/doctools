/* eslint-env node */

const fs = require('fs');
const componentMappper = require('./componentMapper');
const _ = require('lodash');

const path = require('path');

const util = require('./util');
const {getTestCodes} = require('./testParser');

const defaultConfig = require('./configDefaults');

const preProcess = {
    vue(desc, file) {
        Object.assign(desc, componentMappper.unpack(file));
    },
    js(desc, file) {
        desc.script = fs.readFileSync(file, 'utf8');
    }
};

const mapper = {
    'VueComponent'(desc) {

        const res = componentMappper.map(desc);
        Object.assign(desc, res);
        if (desc.template) {
            componentMappper.parseTemplate(desc);
        }
    },
    'UIkitComponent'(desc) {
        const res = componentMappper.map(desc);
        Object.assign(desc, res);
    }
};

/**
 * @mutates
 * @param {DoctoolsConfig} config
 */
function prepareConfig(config) {
    _.defaults(config, defaultConfig);
    //ests teh resourceBase e.g. the root package
    config.resourceBase = config.resourceBase || path.dirname(config.base);
    return config;
}

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

    prepareConfig,

    /**
     * Parses the data defined in config and returns an object containing the parsed structure
     * @param {String|DoctoolsConfig} [config = {}] - filePath or config hash
     * @returns {Object} the parsed structure
     */
    parse(config = {}) {

        if (typeof config === 'string') {
            config = {base: config};
        }

        prepareConfig(config);

        const file = config.base;

        if (fs.lstatSync(file).isDirectory()) {

            const Package = require('./Package');
            const res = new Package(config);
            return res;

        } else {

            let desc = {};

            const extension = file.split('.').pop();

            if (!preProcess[extension]) {
                throw 'unknown extension: ' + extension;
            } else {
                preProcess[extension](desc, file);
            }

            const Module = require('./Module');

            try {

                // const jsDoc = moduleParser.analyzeModule(desc.script, config);

                desc = new Module(config, desc, config.package);

                // Object.assign(desc, jsDoc);

                //coverage
                // const cover = require('./coverage/coverage.sum.json');
                // const covers = {};
                // _.forEach(cover, (entry, name) => {
                //     covers[name.split('/').pop().replace(/.js/g,'')] = entry;
                // });
                // const coverage = covers[name] && covers[name].lines.pct || 0;

                //test codes (per function / member)
                // el.tests = getTestCodes(name, el.longname);

                // desc.runtime = util.findRuntime(config, desc);

                if (mapper[desc.type]) {
                    mapper[desc.type](desc);
                }

        } catch (e) {
            console.warn('error while parsing: ' + file);
            if (config.strict) {
                throw e;
            } else {
                console.log(e.message);
                console.log(e.stack);
            }
        }

            return desc;

        }
    }
}
