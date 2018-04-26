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
     * a glob to search for files to be included
     * @type {GlobString}
     */
    search: 'src/**/*.+(js|vue)',

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
     * @type {Object|String}
     */
    runtime: undefined,

    /**
     * a list of file types to recognize
     * @type {String[]}
     */
    types: ['UIkitComponent', 'VueComponent', 'module'],

    /**
     * weather to watch and patch the documentation on changes (much faster then complete rebuilds)
     * @type {Boolean}
     */
    watch: true,

    /**
     * a glob to search for subpackages (recursively) to be included, or false
     * @type {GlobString|Boolean}
     */
    subPackages: true,

    /**
     * strict mode
     * throw exceptions instead of warnings
     * @type {Boolean}
     */
    strict: false,

    /**
     *
     */
    exclude: [/node_modules/],

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
        'UIkitComponentPlugin',
        'VueComponentPlugin',
        'ComponentLinker'
    ]
};