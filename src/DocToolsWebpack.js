
const path = require('path');
const _ = require('lodash');
const parser = require('./parser');
const {EventEmitter} = require('events');

class DoctoolsWebpack extends EventEmitter {

    constructor(config = {}) {

        super();
        this.config = _.defaults(config, {
            path: process.cwd() + '/docs.json'
        });

        if (this.config.config) {

            const config = require(path.resolve(this.config.config));
            _.defaults(config, this.config);

            this.pack = parser.parse(config);

        } else {
            // TODO will be confused by command line params
            const binPath = require.resolve('../bin/doctools.js');
            this.pack = (process.mainModule.filename === binPath) ? null : parser.parse();
            if (!this.pack) {
                console.warn(this.constructor.name, 'skipped when running from doctools-cli');
            }
        }

        this.initial = true;
    }

    /**
     * abstraction to register a hook to a class member with the same name on newer and older versions of webpack
     * @param {String} name
     */
    registerHook(name, compiler) {
        if (compiler.hooks) {
            compiler.hooks[name].tap(this.constructor.name, (...args) => this[name](...args));
        } else {
            compiler.plugin(name, (...args) => this[name](...args));
        }
    }

    apply(compiler) {

        if (!this.pack) {
            return; //bypass plugin inside devtools
        } else {
            this.pack.config.watch = compiler.options.watch;
        }

        this.registerHook('beforeRun', compiler);

    }

    beforeRun() {
        return this.pack.analyze().then(res => this.pack.write());
    }
}

module.exports = DoctoolsWebpack;