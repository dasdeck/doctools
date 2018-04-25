
const path = require('path');
const _ = require('lodash');
const fs = require('fs');

module.exports = class DocToolsWebpack {

    constructor(config = {}) {

        this.config = _.defaults(config, {
            path: process.cwd() + '/docs.json'
        });

        this.pack = require(__dirname + '/../bin/doctools');

    }

    apply(compiler) {

        if (!this.pack.type) return; //running inside devtools

        compiler.hooks.emit.tap(this.constructor.name, compilation => {

            this.pack.analyze().then(res => {

                const data = this.pack.getDataPackage();
                fs.writeFileSync(this.config.path, JSON.stringify(data, null, 2));
                console.log(this.constructor.name, 'json written to:', this.config.path);
            });

        });

        compiler.hooks.compilation.tap(this.constructor.name, compilation => {

            compilation.hooks.buildModule.tap(this.constructor.name, info => {

                if (info && info.rawRequest) {

                    try {

                        const file = path.resolve(info.rawRequest);
                        if (this.pack.getAllModules().some(module => module.path === file)) {
                            const pack = this.pack.findPackageForFile(file);
                            if (pack) {
                                pack.patch(file);
                            }
                        }

                    } catch (e) {
                        console.log(e);
                    }
                }
            });

        });

    }
}
