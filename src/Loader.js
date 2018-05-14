const Module = require('./Module');

module.exports = class Loader {

    createModule(app, file, parent) {
        return new Module(app, file, parent, this);
    }

}