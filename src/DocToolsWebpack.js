
const path = require('path');
const _ = require('lodash');
const fs = require('fs');

module.exports = class DocToolsWebpack {

    constructor(config = {}) {

        this.config = _.defaults(config, {
            path: process.cwd() + '/docs.json'
        });

        this.pack = require(__dirname + '/../bin/doctools');

        this.initial = true;
    }

    apply(compiler) {


        if (!this.pack.config) {
            return; //bypass plugin inside devtools
        }  else {
            this.pack.config.watch = compiler.options.watch;
        }

        compiler.hooks.done.tap(this.constructor.name, compilation => {

            this.pack.analyze().then(res => {

                const data = this.pack.write().then(data => {

                    fs.writeFileSync(this.config.path, JSON.stringify(data, null, 2));
                    console.log(this.constructor.name, 'json written to:', this.config.path);
                    
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
