const _ = require('lodash');
const {EventEmitter} = require('events');
const fs = require('fs');
const path = require('path');
const util = require('./util');
/**
 * extracting some commong basics for the parsers
 */
module.exports = class TreeItem extends EventEmitter {

    constructor(config, file = config.base, parent = null) {

        super();

        this.config = config;

        this.package = parent;

        this.path = file;
        this.fileInPackage = this.path.replace(this.config.base, '.');
        if (this.fileInPackage === '.') {
            this.fileInPackage += '/';
        }
        this.name = this.path.split('/').pop().split('.').shift();
        this.resource = this.config.getResourceName(this);

        if (config.dev || config.log) {
            this.log = console.log;
            const logDir = path.join(this.config.base, 'log');
            try {fs.mkdirSync(logDir)} catch(e) {};
            this.logFile = (name, data) => fs.writeFileSync(path.join(logDir, name), _.isString(data) ? data : JSON.stringify(data, null, 2));
        } else {
            this.logFile = this.log = x => x;
        }
    }

    init() {

        const desc = this.config._.loaders.reduce((cur, loader) => {
            if (util.match(loader.match, this.path)) {
                cur = loader.load(this.path);
            }
            return cur;
        }, {});

        _.assign(this, desc);

        this.execPluginCallback('onConstruct', {}, true);
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

    execPluginCallback(name, data = null, sync = false) {

        if (!this.config._) {
            // debugger;
        }

        const jobs = this.config._.plugins.map(plugin => {
            return () => plugin.matchesType(this) && plugin[name](this, data) || Promise.resolve();
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