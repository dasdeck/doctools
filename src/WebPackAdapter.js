module.exports = class WebpackAdapter {

    constructor(analyzer) {

        this.analyzer = analyzer;
        this.pack = analyzer.pack;
        this.initial = true;
    }

    apply(compiler) {

        compiler.hooks.done.tap(this.constructor.name, compilation => {
            this.initial = false;
        });

        compiler.hooks.compilation.tap(this.constructor.name, compilation => {
            !this.initial && compilation.hooks.buildModule.tap(this.constructor.name, info => {
                if (info && info.rawRequest) {
                    try {
                        this.analyzer.fileChanged(info.rawRequest);
                    } catch (e) {
                        console.warn(this.constructor.name, ':', e);
                    }
                }
            });

        });

    }

}
