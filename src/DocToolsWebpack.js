
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
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

    apply(compiler) {

        if (!this.pack) {
            return; //bypass plugin inside devtools
        } else {
            this.pack.config.watch = compiler.options.watch;
        }

        compiler.hooks.done.tap(this.constructor.name, compilation => {

            this.pack.analyze().then(res => {

                this.pack.write().then(data => {

                    // if(this.config.path) {

                    // }
                    // fs.writeFileSync(this.config.path, JSON.stringify(data, null, 2));
                    console.log(this.constructor.name, 'updated');

                });

                this.initial = false;
            });

        });

        compiler.hooks.compilation.tap(this.constructor.name, compilation => {

            !this.initial && compilation.hooks.buildModule.tap(this.constructor.name, info => {

                if (info && info.rawRequest) {

                    try {
                        this.pack.patchFile(info.rawRequest);

                    } catch (e) {
                        console.log(e);
                    }
                }
            });

        });

    }
}

module.exports = DoctoolsWebpack;