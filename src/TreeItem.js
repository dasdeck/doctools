/**
 * extracting some commong basics for the parsers
 */
module.exports = class TreeItem {
    constructor(config) {
        this.config = config;

        this.path = config.base;
        this.fileInPackage = this.path.replace(this.resourceBase, '.');
        this.name = this.path.split('/').pop().split('.').shift();
        this.resource = this.path.replace(config.resourceBase, '').replace(/\//g, '.').substr(1);

    }

    serialize() {
        throw 'implement!';
    }

    analyze() {
        throw 'implement';
    }
};