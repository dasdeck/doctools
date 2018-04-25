module.exports = class WebpackAdapter {

    constructor(pack) {
        this.pack = pack;
    }

    apply(compiler) {

        compiler.hooks.compilation.tap(this.constructor.name, compilation => {

            compilation.hooks.buildModule.tap(this.constructor.name, info => {
                if (info && info.rawRequest) {

                    const file = info.rawRequest;

                    const pack = this.pack.findPackageForFile(file);
                    pack && console.log(file);
                }

            });

        });

    }

}
