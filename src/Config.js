// const RuntimeAnalyzer = require('./plugins/RuntimeAnalyzer');

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
        'ComponentLinker',
        'AssetLinker'
        // 'ComponentExporter',
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


    getResourceName(desc) {
        return desc.fileInPackage.substr(1).replace(/\//g, '.').substr(1) || desc.name;
    }
};