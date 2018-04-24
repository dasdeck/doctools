const _ = require('lodash');
const {EventEmitter} = require('events');
/**
 * extracting some commong basics for the parsers
 */
module.exports = class TreeItem extends EventEmitter {
    constructor(config) {

        super();

        this.config = config;

        this.path = config.base;
        this.fileInPackage = this.path.replace(this.resourceBase, '.');
        this.name = this.path.split('/').pop().split('.').shift();
        this.resource = this.path.replace(config.resourceBase, '').replace(/\//g, '.').substr(1);

    }

    execPluginCallback(name, allowPromise = true) {
        const jobs = [];
        _.forEach(this.config.plugins, plugin => {
            if (plugin[name] && plugin.matchesType(this)) {
                const res = plugin[name](this);
                if (res instanceof Promise) {

                    if (!allowPromise) {
                        throw 'can not return promise in:' + name;
                    }
                    jobs.push(res);
                }
            }
        });
        return jobs;
    }

    serialize() {
        throw 'implement!';
    }

    analyze() {
        throw 'implement';
    }

};