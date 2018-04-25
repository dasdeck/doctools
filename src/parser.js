/* eslint-env node */

const fs = require('fs');
const _ = require('lodash');

const path = require('path');

const util = require('./util');
const {getTestCodes} = require('./testParser');

const defaultConfig = require('./Config');


// const UIkitComponentPlugin = require('./UIkitComponentPlugin');
// const VueComponentPlugin = require('./VueComponentPlugin');

/**
 * @mutates
 * @param {DoctoolsConfig} config
 */
function prepareConfig(input) {

    const config = {...input};
    _.defaults(config, defaultConfig);
    //ests teh resourceBase e.g. the root package
    config.resourceBase = config.resourceBase || path.dirname(config.base);

    config.plugins = ['ModulePlugin', ...config.plugins].map(plugin => {

        if (_.isString(plugin)) {
            const Pluigin = require('./plugins/' + plugin);
            plugin = new Pluigin;
        }
        return plugin;
    });

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

    builtinPlugins: [

    ],

    /**
     * Parses the data defined in config and returns an object containing the parsed structure
     * @param {String|DoctoolsConfig} [config = {}] - filePath or config hash
     * @returns {Object} the parsed structure
     */
    parse(config = {}) {

        if (typeof config === 'string') {
            config = {base: config};
        }

        config = prepareConfig(config);

        if (fs.lstatSync(config.base).isDirectory()) {

            const Package = require('./Package');
            return new Package(config);

        } else {

            try {

                const Module = require('./Module');
                return new Module(config);

                //coverage
                // const cover = require('./coverage/coverage.sum.json');
                // const covers = {};
                // _.forEach(cover, (entry, name) => {
                //     covers[name.split('/').pop().replace(/.js/g,'')] = entry;
                // });
                // const coverage = covers[name] && covers[name].lines.pct || 0;

                //test codes (per function / member)
                // el.tests = getTestCodes(name, el.longname);



            } catch (e) {
                console.warn('error while parsing: ' + config.base);
                if (config.strict) {
                    throw e;
                } else {
                    console.log(e.message);
                    console.log(e.stack);
                }
            }


        }
    }
};
