/**
 * @file
 * @type {example}
 * @name config
 */

 /**
  * a sample config
  */
module.exports = {

    /**
     * @type {String} the base directory
     *
     */
    base: process.cwd(),

    /**
     * a glob to search for files to be included
     * @type {GlobString}
     */
    search: '+(src|ui)/**/*.+(js|vue)',

    /**
     * enables 'hot reload' for the parser code
     * @type {Boolean}
     */
    developMode: false,

    /**
     * when no default value is provided, try to parse one
     * @type {Boolean}
     */
    inferParameterDefaults: true,

    /**
     * provide a hash for the doctools to introspect on the actual code
     * @type {Object}
     */
    runtime: undefined,

    /**
     * a list of file types to recognize
     */
    types: ['UIkitComponent', 'VueComponent', 'module'],

    /**
     * weather to watch and patch the documentation
     * @type {Boolean}
     */
    watch: true
};