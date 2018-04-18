const globals = [
    'window',
    'Element',
    'Node',
    'NodeList',
    'HTMLCollection',
    'navigator',
    'document'
];

const store = {};

module.exports = {


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


    },

    get() {
        if (!this.uikit) {

            this.install();
            this.uikit = require('uikit');
            this.clear();
        }
        return this.uikit;
    },

    clear() {
        globals.forEach(name => {
            global[name] = store[name];
        });
    }
}


