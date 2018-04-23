const globals = [
    'window',
    'Element',
    'Node',
    'NodeList',
    'HTMLCollection',
    'navigator',
    'document'
];

/**
 * @file
 * a set of tools to load UIkit insinde a Node environement
 * this does not claim to be complete at all!
 */

const store = {};


/**
 * uikit tools
 */
module.exports = {

    /**
     * shims all neceserry globals in order for UIkit to bootsrap
     */
    install() {
        globals.forEach(name => {
            store[name] = global[name];
        });

        window = {...global, addEventListener: () => {}};

        Element = () => {};
        Element.prototype = {};

        Node = () => {};
        Node.prototype = {};

        NodeList = () => {};
        NodeList.prototype = {};

        HTMLCollection = () => {};
        HTMLCollection.prototype = {};

        navigator = () => {};


        document = {
            documentElement: {
                doScroll() {}
            },
            createElement: () => ({classList: {add() {}, toggle() {}, contains() {}}})
        };

        this.uikit = require('uikit');

    },

    /**
     * registers UIkit as a global variable, similar to the browser version
     */
    registerGlobal() {
        UIkit = this.get();
    },


    /**
     * gets the UIkit object
     */
    get() {
        if (!this.uikit) {

            this.install();
            this.clear();
        }
        return this.uikit;
    },


    /**
     * resets the global varaibles to their initial state
     */
    clear() {
        globals.forEach(name => {
            global[name] = store[name];
        });
    }
};

