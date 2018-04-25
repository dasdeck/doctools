module.exports = class WebpackAdapter {

    constructor(pack) {
        this.pack = pack;
        this.initial = true;
    }

    apply(compiler) {

        compiler.hooks.emit.tap(this.constructor.name, compilation => {
            this.initial = false;
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
