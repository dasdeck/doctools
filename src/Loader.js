const Module = require('./Module');

module.exports = class Loader {

    createModule(app, file) {
        return new Module(app, file, this);
    }

}