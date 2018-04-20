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
     * @param {String|Object} [config = {}] - filePath or config hash
     * @param {String} config.base - root path to operate on
     * @returns {Object} the parsed structure
     */
    parse(config = {}) {

        if (typeof config === 'string') {
            config = {base: config};
        }

        prepareConfig(config);

        const file = config.base;

        const resource = file.replace(config.resourceBase, '').replace(/\//g, '.').substr(1);

        if (fs.lstatSync(file).isDirectory()) {

            const packageParser = require('./packageParser');
            const res = packageParser.analyzePackage(config);
            res.resource = resource;
            return res;
        }

        const name = file.split('/').pop().split('.').shift();
        const desc = {
            file,
            package: config.package && config.package.resource,
            name,
            resource,
            type: 'module'
        };

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