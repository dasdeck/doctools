const Plugin = require('../Plugin');
const util = require('../util');
const fs = require('fs');
const tempfile = require('tempfile');
const _ = require('lodash');
const webpack = require('webpack');
const MemFs = require('memory-fs');
const requireFromString = require('require-from-string');
const Package = require('../Package');


/**
 * attemts to load the described class
 * mark module for runtime analysis by setting a member runtime = true
 */
class RuntimeAnalyzer extends Plugin {

    constructor(config = RuntimeAnalyzer.defaultOptions) {

        super();

        this.config = config;
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
     *
     * @param {Object} desc
     * @returns {Boolean}
     */
    matchesType(desc) {
        const isPackage = desc.type === 'package' || desc instanceof Package;
        return desc.config.runtime && isPackage && desc.isRootPackage();

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

        const jobs = pack.getAllModules().map(resource => this.analyzeRuntime(resource));
        return Promise.all(jobs);
    }

    /**
     * analyzesRuntimes for on module
     */
    analyzeRuntime(desc) {
        const {config} = desc;

        if (config.runtime) {

            if (_.isString(config.runtime)) {

                // const serv = this.getRuntimeService(desc);
                return this.getRuntime(desc.resource).then(runtime => {
                    desc.runtime = runtime;
                });


            } else if(config.runtime === true) {
                throw 'unimplemented';

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

    /**
     * cleat runtime cache if file was
     * @deprecated
     */
    onPatch() {
    }


    adaptConfig(files) {

        files = _.isArray(files) ? files : [files];

        const entry = {};

        files.forEach(name => {
            entry[name] = name;
        });

        const runtime = require(this.pack.config.runtime);
        return {
            ...runtime,
            entry,
            output: {
                libraryTarget: 'commonjs'
            }
        };

    }

    createCompiler(filename = this.indexFile) {

        const conf = this.adaptConfig(filename);

        const WebpackAdapter = require('../WebpackAdapter');
        const plugin = new WebpackAdapter(this.pack);

        conf.plugins = conf.plugins || [];
        conf.plugins.push(plugin);

        const compiler = webpack(conf);

        compiler.outputFileSystem = this.outputFileSystem;


        return compiler;

    }

    writeIndex(pack = this.pack) {

        const files = pack.getAllModules();//_.filter(, res => res.type !== 'package');

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
        if (this.cache) {
            return Promise.resolve(this.cache[resource]);
        } else {
            return new Promise(resolve => {
                this.once('change', res => resolve(res[resource]));
            })
        }

    }

    run() {

        this.compiler = this.compiler || this.createCompiler(this.writeIndex());
        
        // ignored: '**/*'
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

    onWebPack(err, res) {

        const resfname = Object.keys(res.compilation.assets)[0];
        const script = this.outputFileSystem.readFileSync(resfname ,'utf8');

        this.pack.logFile('index.min.js', script);
        try {
            
            // const code = `const clear = require('jsdom-global')();
            // ${script}
            // clear();`            
            
            // const vm = require('vm');

            // const sandbox = {require};
            // vm.createContext(sandbox);

            // const rt = vm.runInContext(code, sandbox);

            const clear = require('jsdom-global')();
            const rt = requireFromString(script);
            setImmediate(clear);

            this.cache = rt.default ? rt.default : rt;
            this.emit('change', this.cache);
            // resolve(rt.default ? rt.default : rt);
            this.pack.log('webpack built');
        } catch(e) {
            this.pack.log('could not load runtime');
            this.pack.log(e);
            // resolve({});
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
}

RuntimeAnalyzer.defaultOptions = {
    watch: true
}

module.exports = RuntimeAnalyzer;