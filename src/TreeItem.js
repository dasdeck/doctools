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


    }

    init() {

        this.execPluginCallback('onConstruct', true);
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

    execPluginCallback(name, sync = false) {

        const jobs = [];

        _.forEach(this.config.plugins, plugin => {
                jobs.push(() => {
                        return plugin.matchesType(this) && plugin[name](this) || Promise.resolve();
                });
        });

        if (sync) {
            jobs.forEach(job => {
                job();
            });
        } else {
            return jobs.reduce(function(p, fn) {
                return p = p.then(fn);
            }, Promise.resolve());

        }

        // return Promise.all(jobs);
    }

    serialize() {
        throw 'implement!';
    }

    analyze() {
        throw 'implement';
    }

};