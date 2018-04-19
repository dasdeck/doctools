/* eslint-env node */

const fs = require('fs');
const componentMappper = require('./componentMapper');
const _ = require('lodash');

const util = require('./util');
const {getTestCodes} = require('./testParser');

const defaultConfig = require('./configDefaults');

const  preProcess = {
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
     * @param {String|Object} [config = {}] - filePath or config hash
     * @param {String} config.base - root path to operate on
     * @returns {Object} the parsed structure
     */
    parse(config = {}) {

        if (typeof config === 'string') {
            config = {base: config};
        }

        _.defaults(config, defaultConfig);

        const file = config.base;

        const name = file.split('/').pop().split('.').shift();
        const desc = {file, name, type: 'module'};

        if (fs.lstatSync(file).isDirectory()) {

            const packageParser = require('./packageParser');
            const res = packageParser.analyzePackage(config);
            Object.assign(desc, res);
            return res;
        }

        const extension = file.split('.').pop();

        if (!preProcess[extension]) {
            throw 'unknown extension: ' + extension;
        } else {
            preProcess[extension](desc, file);
        }

        const moduleParser = require('./moduleParser');
        try {

            const jsDoc = moduleParser.analyzeModule(desc.script, config);

            Object.assign(desc, jsDoc);
            //coverage
            // const cover = require('./coverage/coverage.sum.json');
            // const covers = {};
            // _.forEach(cover, (entry, name) => {
            //     covers[name.split('/').pop().replace(/.js/g,'')] = entry;
            // });
            // const coverage = covers[name] && covers[name].lines.pct || 0;

            //test codes (per function / member)
            // el.tests = getTestCodes(name, el.longname);

            desc.runtime = util.findRuntime(config, desc);

            if (mapper[desc.type]) {
                mapper[desc.type](desc);
            }

    } catch (e) {
        console.warn('error while parsing: ' + file);
        throw e;
    }

        return desc;
    }
}

exports.de