const Plugin = require('../Plugin');
const util = require('../util');
const fs = require('fs');
const tempfile = require('tempfile');
const _ = require('lodash');
const webpack = require('webpack');
const MemFs = require('memory-fs');
const requireFromString = require('require-from-string');
const Package = require('../Package');
const path = require('path');
const mkpath = require('mkpath');

/**
 * attemts to load the described class
 * mark module for runtime analysis by setting a member runtime = true
 */
class RuntimeAnalyzer extends Plugin {

    constructor(config = RuntimeAnalyzer.defaultOptions) {

        super();

        this.config = config;

        _.defaults(this.config, RuntimeAnalyzer.defaultOptions);

        this.indexFile = tempfile('.js');

    }

    /**
     *assozciate the package to build and watch
     * @param {Object} desc
     */
    onConstruct(pack) {

        this.pack = pack;

        this.config.watch = this.config.watch && this.pack.config.watch;

        this.outputFileSystem = new MemFs;

        this.on('change', () => {
            pack.getRootPackage().emit('change');

        });
    }

    /**
     * helper function to load the runtime for a component or module
     * @param {*} config
     * @param {*} desc
     */
    onAnalyze(pack) {

        if (!this.cache) {
            this.run();
        }

        if (this.load()) {
            const jobs = this.getRuntimeModules().map(resource => this.analyzeRuntime(resource));
            return Promise.all(jobs);
        } else {
            return this.getScript();
        }
    }

        /**
     * cleat runtime cache if file was
     * @deprecated
     */
    onPatch() {

        this.patched = true;
        delete this.cache;

    }


    onDispose() {
        if (this.watcher) {
            this.watcher.close();
        }
    }

    onGet(desc, data) {

        if (this.config.serve) {
            data[this.config.serve] = this.script;
        }
    }

        /**
     *
     * @param {Object} desc
     * @returns {Boolean}
     */
    matchesType(desc) {
        const isPackage = desc.type === 'package' || desc instanceof Package;
        return isPackage && desc.isRootPackage();

    }

    getRuntimeModules() {
        return this.pack.getAllModules().filter(mod => mod.runtime);
    }

    /**
     * analyzesRuntimes for on module
     */
    analyzeRuntime(desc) {
        const {config} = desc;

        if (config.runtime) {

            if (_.isString(config.runtime) || config.runtime === true) {

                // const serv = this.getRuntimeService(desc);
                return this.getRuntime(desc.resource).then(runtime => {
                    desc.runtime = runtime || true;
                });


            } else {
                const runtime = _.get(config.runtime, `${desc.type}.${desc.name}`) || _.get(config.runtime, desc.name);
                return Promise.resolve(runtime || {});
            }
        }

        if (config.crudeImport) {
            try {
                return Promise.resolve(this.crudeImport(desc.script));
            } catch (e) {
                console.warn('could not import runtime for: ' + desc.name);
                console.warn(e);
            }
        }

        return Promise.resolve({});
    }


    adaptConfig(files) {

        files = _.isArray(files) ? files : [files];

        const entry = {};

        files.forEach(name => {
            entry[name] = name;
        });

        const p = this.pack.config.runtime === true ? path.join(this.pack.config.base, 'webpack.config.js') : this.pack.config.runtime;
        try {
            const runtime = require(p);
            const origConf = _.isArray(runtime) ? runtime[0] : (_.isFunction(runtime) ? runtime({}) : runtime);
            return {
                ...origConf,
                target: this.config.target,
                entry,
                output: {
                    libraryTarget: this.config.libraryTarget,
                    library: this.config.library
                }
            };

        } catch (e) {
            throw 'could not load webpack config: ' + p + e.message;
        }

    }

    createCompiler(filename = this.indexFile) {

        const conf = this.adaptConfig(filename);

        const WebpackAdapter = require('../WebpackAdapter');
        const plugin = new WebpackAdapter(this);

        conf.plugins = [...(conf.plugins || []), plugin];

        const compiler = webpack(conf);

        compiler.outputFileSystem = this.outputFileSystem;

        return compiler;

    }

    writeIndex(pack = this.pack) {

        const files = this.getRuntimeModules();//_.filter(, res => res.type !== 'package');

        const imports = files.map(desc => {
            const file = desc.path;
            const varName = util.escapeVariableName(file);
            const importString = `import ${varName} from '${file}';`;
            return importString;
        }).join('\n');

        const assigns = files.map(desc => {
            const file = desc.path;
            const varName = util.escapeVariableName(file);
            const assignmentString = `exp['${desc.resource}'] = ${varName};`;
            return assignmentString;
        }).join('\n');

        const res = [imports, 'const exp = {};', assigns, 'export default exp;'].join('\n');

        pack.log('writing index:');
        pack.logFile('index.js', res);
        fs.writeFileSync(this.indexFile, res);

        return this.indexFile;
    }

    getScript() {
        if (this.script) {
            return Promise.resolve(this.script);
        } else {
            return new Promise(resolve => {
                this.once('change', res => resolve(this.script));
            })
        }
    }

    getRuntime(resource) {

        if (!this.config.async) {
            if (this.cache) {
                return Promise.resolve(this.cache[resource]);
            } else {
                return new Promise(resolve => {
                    this.once('change', res => {
                        resolve(this.cache && this.cache[resource])
                    });
                })
            }

        } else {
            return Promise.resolve();
        }

    }

    run() {

        this.compiler = this.compiler || this.createCompiler(this.writeIndex());

        // ignored: '**/*'
        if(this.config.watch) {

            if (this.watcher){
                return;
            }
            this.firstBuild = true;
            this.pack.log('watching package:', this.pack.name);
            this.watcher = this.compiler.watch({}, (...args) => this.onWebPack(...args));
        } else {

            // TODO dont run if cache is valid ?
            this.pack.log('building package:', this.pack.name);
            this.compiler.run((...args) => this.onWebPack(...args));
        }
    }

    fileChanged(file) {
        if (this.load()) {
            //if this runtime is used for analysis, inform the tree to reeanalyse
            this.pack.patchFile(file);
        } else {
            //simple trigger a change after webpack
            this.patched = true;
        }
    }

    onWebPack(err, res) {


        const resfname = Object.keys(res.compilation.assets)[0];
        const script = this.outputFileSystem.readFileSync(resfname ,'utf8');

        const scriptChanged = script !== this.script;

        //we might need to trigger a change, even if the script did not change, e.g. if a doc block changed
        const triggerChange = this.patched || scriptChanged && !this.firstBuild;

        this.firstBuild = false;


        if (scriptChanged) {

            this.script = script;

            if (this.config.output) {

                let dir;
                if (path.isAbsolute(this.config.output)) {
                    dir = this.config.output;
                } else {
                    dir = path.join(this.pack.config.base, this.config.output);
                }
                mkpath.sync(dir);
                const file = path.join(dir, 'index.js');
                fs.writeFileSync(file, script);
                this.pack.log('runtime written to:', file);

            }

            if (this.load()) {

                try {

                    const clear = require('jsdom-global')();
                    const rt = requireFromString(script);
                    setImmediate(clear);

                    this.cache = rt[this.config.library].default;

                } catch(e) {

                    this.pack.log('could not load runtime');
                    this.pack.log(e);
                }

            }
        }


        this.patched = false;

        if (triggerChange) {

            this.pack.log('webpack built');
            this.emit('change', this.cache);
        }

    }

    /**
     *
     * @param {DoctoolsConfig} config
     * @param {String} filename
     * @returns {Promise} returns an object with the result of a webpacked require of the given file
     */
    webpackFile(config, filename) {

        try {

            const compiler = this.createCompiler(filename);

            return new Promise(resolve => {

                compiler.run((err, res) => {
                    const resfname = Object.keys(res.compilation.assets)[0];
                    const data = compiler.outputFileSystem.readFileSync(resfname ,'utf8');
                    try {
                        const rt = requireFromString(data);
                        resolve(rt.default ? rt.default : rt);
                        this.pack.log('webpacked:', filename);
                    } catch(e) {
                        this.pack.warn('could not load runtime for:', filename);
                        resolve({});
                    }
                });
            });

        } catch(e) {
            console.warn(e);
            return Promise.reject(e);
        }
    }

    load() {
        return this.config.libraryTarget === 'commonjs';
    }
}

RuntimeAnalyzer.defaultOptions = {
    watch: true,
    output: false,
    libraryTarget: 'commonjs',
    library: 'runtime',
    serve: false,
    target: 'node',
    async: false
}

module.exports = RuntimeAnalyzer;