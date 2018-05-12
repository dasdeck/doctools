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
    onLoad(pack) {

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

        //deregister all local watcher in favor of webpack's watcher
        if (this.config.watch) {
            this.getRuntimeModules().forEach(module => {

                module.unwatchAsset(module.path);

            });
        }

        if (!this.script) {
            this.run();
        }

        const jobs = this.getRuntimeModules().map(resource => this.analyzeRuntime(resource));
        return Promise.all(jobs);
    }

        /**
     * cleat runtime cache if file was
     * @deprecated
     */
    onPatch() {

        this.patched = true;
        delete this.cache;
        delete this.script;

    }


    onDispose() {
        if (this.watcher) {
            this.watcher.close();
        }
    }

    /**
     *
     * @param {Object} desc
     * @returns {Boolean}
     */
    matchesType(desc) {
        return desc.isRootPackage();

    }

    getRuntimeModules() {
        return this.pack.getAllModules().filter(mod => mod.runtime);
    }

    /**
     * analyzesRuntimes for on module
     */
    analyzeRuntime(desc) {
        const {config} = desc;

        if (_.isPlainObject(this.config.runtime)) {

            const runtime = _.get(this.config.runtime, `${desc.type}.${desc.name}`) || _.get(this.config.runtime, desc.name);
            return Promise.resolve(runtime || {});

        } else {
            return this.getRuntime(desc.resource).then(runtime => {
                desc.runtime = runtime || true;
            });
        }

    }


    adaptConfig(files) {

        files = _.isArray(files) ? files : [files];

        const entry = {};

        files.forEach(name => {
            entry[name] = name;
        });

        const p = this.config.runtime === true ? path.join(this.pack.config.base, 'webpack.config.js') : this.config.runtime;
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

        ;
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

    getRuntime(resource) {

        if (!this.config.async) {
            if (this.cache) {
                return Promise.resolve(this.cache[resource]);
            } else {
                return new Promise(resolve => {
                    this.once('built', res => {
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

        this.firstBuild = true;

        if(this.config.watch) {

            if (this.watcher){
                return;
            }
            this.pack.log('watching package:', this.pack.name);
            this.watcher = this.compiler.watch({}, (...args) => this.onWebPack(...args));
        } else {

            // TODO dont run if cache is valid ?
            this.pack.log('building package:', this.pack.name);
            this.compiler.run((...args) => this.onWebPack(...args));
        }
    }

    fileChanged(file) {

        this.pack.log('webpack:', file);

        if(this.pack.getResourceByFile(file)) {
            //if this runtime is used for analysis, inform the tree to reeanalyse
            this.pack.patchFile(file);
        }
    }

    writeToDisk() {
        const dir = this.pack.resolvePath(this.config.output);
        mkpath.sync(dir);
        const file = path.join(dir, 'index.js');
        fs.writeFileSync(file, this.script);
        this.pack.log(this.constructor.name, 'runtime written to:', file);
    }

    scriptChanged() {

        if (this.config.output) {
            this.writeToDisk();
        }

        this.loadScript();

    }

    loadScript() {
        try {

            const clear = require('jsdom-global')();

            // eval(this.script);
            const rt = requireFromString(this.script);
            setImmediate(clear);

            this.cache = rt.default;

        } catch(e) {

            this.pack.log('could not load runtime');
            this.pack.log(e);
        }
    }

    onGet(desc, data) {

        if (this.config.serve) {
            data[this.config.serve] = this.script;
        }
    }

    onWebPack(err, res) {

        const resfname = Object.keys(res.compilation.assets)[0];
        const script = this.outputFileSystem.readFileSync(resfname ,'utf8');

        const scriptChanged = script !== this.script;

        //we might need to trigger a change, even if the script did not change, e.g. if a doc block changed
        const triggerChange = this.patched || scriptChanged && !this.firstBuild;

        this.firstBuild = false;
        this.patched = false;


        if (scriptChanged) {

            this.script = script;

            this.scriptChanged();

        }


        this.pack.log(this.constructor.name, 'webpack built', triggerChange);

        this.emit('built');

        if (triggerChange) {

            this.emit('change', this.cache);
        }

    }

}

RuntimeAnalyzer.defaultOptions = {

    /**
     * provide a hash for the doctools to introspect on the actual code
     * or a path to a webpack config to build modules on the fly
     * if set to true, doctools will attempt to autoload your webpack config
     * @type {Object|String|Boolean}
     */
    runtime: true,
    watch: true,
    output: false,
    libraryTarget: 'umd',
    library: 'RuntimeAnalyzer',
    target: 'web',
    serve: 'runtime'
}

module.exports = RuntimeAnalyzer;