module.exports = class WebpackAdapter {

    constructor(analyzer) {

        this.analyzer = analyzer;
        this.initialBuild = true;
    }

    apply(compiler) {

        compiler.hooks.done.tap(this.constructor.name, compilation => {
            this.initialBuild = false;
        });

        compiler.hooks.compilation.tap(this.constructor.name, compilation => {
             compilation.hooks.buildModule.tap(this.constructor.name, info => {
                if (info && info.rawRequest) {
                    const file = info.rawRequest;
                    try {
                        if (this.analyzer.pack.getResourceByFile(file)) {
                            console.log(this.analyzer.constructor.name, 'webpack:', file);
                            if (!this.initialBuild) {
                                this.analyzer.fileChanged(file);
                            }
                        }
                    } catch (e) {
                        console.warn(this.constructor.name, ':', e);
                    }
                }
            });

        });

    }

}
