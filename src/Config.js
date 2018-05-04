const RuntimeAnalyzer = require('./plugins/RuntimeAnalyzer');
const VueRunner = require('./runnner/VueRunner');

/**
 * @file
 * @type {example}
 * @name config
 */

 /**
  * a sample config
  * @typedef DoctoolsConfig
  */
module.exports = {

    /**
     * @type {String} the base directory
     */
    base: process.cwd(),

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
     * provide a hash for the doctools to introspect on the actual code
     * or a path to a webpack config to build modules on the fly
     * if set to true, doctools will attempt to autoload your webpack config
     * @type {Object|String|Boolean}
     */
    runtime: true,

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
        'VueLoader'
    ],
    /**
     * extra mapping plugins
     */
    plugins: [
        'RuntimeAnalyzer',
        // () => new RuntimeAnalyzer(VueRunner.RTAConfig),
        'ModuleMapper',
        'UIkitComponentMapper',
        'VueComponentMapper',
        'ComponentLinker',
        // 'MarkdownExporter',
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

     /**
     * a glob to search for subpackages (recursively) to be included, or false
     * @type {GlobString|Boolean}
     */
    subPackages: true,

        /**
     * a glob to search for files to be included
     * @type {GlobString}
     */
    search: 'src/**/*.+(js|vue)',

    getResourceName(desc) {
        return desc.fileInPackage.substr(1).replace(/\//g, '.').substr(1) || desc.name;
    }
};