/* eslint-env node */

const fs = require('fs');
const _ = require('lodash');

const path = require('path');

const util = require('./util');
// const {getTestCodes} = require('./testParser');

const defaultConfig = require('./Config');

const DocTools = require('./Doctools');

function forcePlugin(name, list, path) {
    if (!list.some(plugin => plugin === name || plugin.constructor && plugin.constructor.name === name)) {
        const Pluigin = require('./' + path + '/' + name);
        plugin = new Pluigin;
        list.unshift(plugin);
    }
}

function loadPlugins(config) {

    if (config._) return;

    config._ = {};


    config._.plugins = [...config.plugins]


    config._.plugins = config._.plugins.map(plugin => {

        if (_.isString(plugin)) {
            const Pluigin = require('./plugins/' + plugin);
            plugin = new Pluigin;
        } else if (_.isFunction(plugin)) {
            plugin = plugin();
        }
        return plugin;
    });

    forcePlugin('PackageMapper', config._.plugins, 'plugins');
    forcePlugin('ModuleMapper', config._.plugins, 'plugins');


    config._.loaders = [ ...config.loaders];


    config._.loaders = config._.loaders.map(loader => {

        if (_.isString(loader)) {
            const Loader = require('./loaders/' + loader);
            loader = new Loader;
        } else if (_.isFunction(loader)) {
            loader = loader();
        }
        return loader;
    });

    forcePlugin('PackageLoader', config._.loaders, 'loaders');
    forcePlugin('DefaultLoader', config._.loaders, 'loaders');



}

 /**
* @mutates
* @param {DoctoolsConfig} config
*/
function prepareConfig(config) {

    if (!config._) {

        config = {...config};

        const base = config.base || defaultConfig.base;

        //ests teh resourceBase e.g. the root package
        // config.resourceBase = config.resourceBase || fs.lstatSync(base).isDirectory() ? base : path.dirname(base);

        const configFile = path.join(base, 'doctools.config.js');

        if (fs.existsSync(configFile)) {
            console.log('config file used: ', configFile);
            const confFromFile = require(path.resolve(configFile));
            if (confFromFile.config) {
                throw 'use config option only on cli';
            }
            _.defaults(config, confFromFile);
            //override base
            config.base = confFromFile.base || config.base;
        }

        _.defaults(config, defaultConfig);


    }

    loadPlugins(config);

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

        config = prepareConfig(config);

       const app = new DocTools;

       app.parse(config);

       return app;

        // if (fs.lstatSync(config.base).isDirectory()) {

        //     const Package = require('./Package');
        //     return new Package(config);

        // } else {

        //     try {

        //         const Module = require('./Module');
        //         return new Module(config);

        //     } catch (e) {
        //         console.warn('error while parsing: ' + config.base);
        //         if (config.strict) {
        //             throw e;
        //         } else {
        //             console.warn(e.message);
        //             console.warn(e.stack);
        //         }
        //     }


        // }
    },

    load(file ,config) {

    }
};
