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
module.exports = class RuntimeAnalyzer extends Plugin {

    constructor() {

        super();
        this.indexFile = tempfile('.js');

    }

    /**
     *assozciate the package to build and watch
     * @param {Object} desc
     */
    onConstruct(pack) {

        this.pack = pack;

        if (this.pack.config.watch) {
            this.on('change', () => {
                pack.getRootPackage().emit('change');
            });
        }
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

        if(!this.cache) {
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

                // return this.webpackFile(config, desc.path);

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

        // delete this.cache;

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

    // onSerialize(desc, data) {
    //     delete data.runtime;
    // }

    createCompiler(filename = this.indexFile) {

        const conf = this.adaptConfig(filename);

        // this.pack.logFile('webpack.config.js', 'module.exports = ' + JSON.stringify({
        //     ...conf,
        //     entry: {
        //         'index': './index.js'
        //     }
        // }, null, 2));

        const WebpackAdapter = require('../WebpackAdapter');
        const plugin = new WebpackAdapter(this.pack);

        conf.plugins = conf.plugins || [];
        conf.plugins.push(plugin);
        // debugger;
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

        this.writeIndex();

        if (this.pack.config.watch && this.watcher){
            return;
        }


        this.outputFileSystem = new MemFs;

        const compiler = this.createCompiler(this.indexFile);

        compiler.inputFileSystem = compiler.inputFileSystem;


        // ignored: '**/*'
        if(this.pack.config.watch) {
            this.pack.log('watching package:', this.pack.name);
            this.watcher = compiler.watch({}, (...args) => this.onWebPack(...args));
        } else {
            this.pack.log('building package:', this.pack.name);
            compiler.run((...args) => this.onWebPack(...args));
        }
    }

    onWebPack(err, res) {

        const resfname = Object.keys(res.compilation.assets)[0];
        const script = this.outputFileSystem.readFileSync(resfname ,'utf8');

        this.pack.logFile('index.min.js', script);
        try {
            const clear = require('jsdom-global')();
            const rt = requireFromString(script);
            clear();

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