

// const store = {};
// const dom = new jsdom.JSDOM();

/**
 * uikit tools
 */
module.exports = {

    /**
     * shims for some browser globals
     */
    install() {

        this.clear = require('jsdom-global')();

        // /**
        //  * turns the node environment into a limited browser environment
        //  */
        // Object.getOwnPropertyNames(dom.window).forEach(name => {

        //     const value = dom.window[name];

        //     if (!global[name]) {
        //         global[name] = value;
        //     }

        //     store[name] = global[name];

        // });

    },

    // /**
    //  * resets the global variables to their initial state
    //  */
    // clear() {

    //     Object.getOwnPropertyNames(store).forEach(name => {
    //         global[name] = store[name];
    //     });
    // }
};

