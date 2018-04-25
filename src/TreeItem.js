const _ = require('lodash');
const {EventEmitter} = require('events');
/**
 * extracting some commong basics for the parsers
 */
module.exports = class TreeItem extends EventEmitter {

    constructor(config, file = config.base, pack = null) {

        super();

        this.package = pack;

        this.config = config;

        this.path = file;
        this.fileInPackage = this.path.replace(this.config.resourceBase, '.');
        this.name = this.path.split('/').pop().split('.').shift();
        this.resource = this.path.replace(config.resourceBase, '').replace(/\//g, '.').substr(1);

        this.execPluginCallback('onConstruct');

    }

    getRootPackage() {
        if (this.package) {
            return this.package.getRootPackage();
        } else {
            return this;
        }
    }

    isRootPackage() {
        return this === this.getRootPackage() && this.package === null;
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
        return Promise.all(jobs);
    }

    serialize() {
        throw 'implement!';
    }

    analyze() {
        throw 'implement';
    }

};