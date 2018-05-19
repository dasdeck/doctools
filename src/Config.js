// const RuntimeAnalyzer = require('./plugins/RuntimeAnalyzer');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const {EventEmitter} = require('events');
const chokidar = require('chokidar');
const util = require('./util');
/**
 * @file
 * @type {example}
 * @name config
 */

 /**
  * a sample config
  * @typedef DoctoolsConfig
  */
class Config extends EventEmitter {


    constructor(data = {}) {

        super();

        this.plugins = [];
        this.inputConfig = data;
        // _.assign(this, data);

    }

    addPlugin(plugin) {
        this.plugins.push(plugin);
    }

    forcePlugin(name, list, path) {
        if (!list.some(plugin => plugin === name || plugin.constructor && plugin.constructor.name === name)) {
            const Plugin = require('./' + path + '/' + name);
            const plugin = new Plugin;
            list.unshift(plugin);
        }
    }

    loadPlugins(config, app) {

        config._ = {};

        config._.plugins = [...config.plugins, ...this.plugins]

        config._.plugins = config._.plugins.map(plugin => {

            if (_.isString(plugin)) {
                const Pluigin = require('./plugins/' + plugin);
                plugin = new Pluigin;
            } else if (_.isFunction(plugin)) {
                plugin = plugin();
            }
            return plugin;
        });

        this.forcePlugin('PackageMapper', config._.plugins, 'plugins');
        this.forcePlugin('ModuleMapper', config._.plugins, 'plugins');
        this.forcePlugin('TypeMapper', config._.plugins, 'plugins');
        this.forcePlugin('AssetLinker', config._.plugins, 'plugins');


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

        this.forcePlugin('PackageLoader', config._.loaders, 'loaders');
        this.forcePlugin('DefaultLoader', config._.loaders, 'loaders');

        config._.plugins.forEach(plugin => plugin.app = app);

    }

     /**
    * @mutates
    * @param {DoctoolsConfig} config
    */
    prepareConfig(app) {

        const config = _.cloneDeep(this.inputConfig);


        const base = config.base || Config.defaultConfig.base;

        //ests teh resourceBase e.g. the root package
        // config.resourceBase = config.resourceBase || fs.lstatSync(base).isDirectory() ? base : path.dirname(base);

        const configFile = path.join(base, 'doctools.config.js');

        if (fs.existsSync(configFile)) {


            // const confFromFile = eval(fs.readFileSync(path.resolve(configFile), 'utf8'));
            const confFromFile = require(path.resolve(configFile), 'utf8');

            if (confFromFile.config) {
                throw 'use config option only on cli';
            }
            _.defaults(config, confFromFile);

            config.file = configFile;

            //override base
            config.base = confFromFile.base || config.base;
        }

        _.defaults(config, Config.defaultConfig);


        this.loadPlugins(config, app);

        config.hash = util.hash(config);

        return config;
    }

}


Config.defaultConfig = {

    /**
     * @type {String} the base directory
     */
    base: process.cwd(),

    /**
     * overwrite the default cachedir (config.base)
     */
    cachedir: true,

    /**
     * enables 'hot reload' for the parser code
     * usefule wehn working on the actual parser code
     * @type {Boolean}
     */
    developMode: false,

    /**
     * when no default value is provided, try to parse one from the source code (regex)
     * @type {Boolean}
     */
    inferParameterDefaults: true,


    /**
     * weather to watch and patch the documentation on changes (much faster then complete rebuilds)
     * @type {Boolean}
     */
    watch: true,


    menu: false,

    /**
     *
     */
    exclude: [/node_modules/, /\/\./],

    /**
     *
     */
    include: [/.*/],

    /**
     *
     */
    loaders: [
        'VueLoader',
        'MarkdownLoader'
    ],
    /**
     * extra mapping plugins
     */
    plugins: [
        'RuntimeAnalyzer',
        'ModuleMapper',
        'UIkitComponentMapper',
        'VueComponentMapper',
        'ComponentLinker'


        // 'HTMLExporter',
        // 'VuePressExporter',
    ],

    /** enables or disables menus */
    menus: {
        menu: true,
        packages: true,
        files: true
    },

    /**
     * strict mode
     * throw exceptions instead of warnings
     * @type {Boolean}
     */
    strict: false,

    output: 'docs.json',

     /**
     * a glob to search for subpackages (recursively) to be included, or false
     * @type {GlobString|Boolean}
     */
    subPackages: true,


    getResourceUri(desc) {
        return desc.fileInPackage.substr(1).replace(/\//g, '.').substr(1) || desc.name;
    }
};

module.exports = Config;