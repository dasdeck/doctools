const Plugin = require('./Plugin');
const util = require('../util');
const fs = require('fs');
const tempfile = require('tempfile');
const _ = require('lodash');
const webpack = require('webpack');
const MemFs = require('memory-fs');
const requireFromString = require('require-from-string');
const browser = require('./Browser');
const Package = require('../Package');

module.exports = class RuntimeAnalyzer extends Plugin {

    constructor() {

        super();
        this.indexFile = tempfile('.js');

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

    // onSerialize(desc) {
    //     if (desc.type === 'package' && desc.isRootPackage()) {
    //         this.createLinks(desc);
    //     }
    // }

    onMap(desc) {

        desc.config.types.forEach(type => {

            const resources = desc.resources;

            _.forEach(desc.resources, comp => {

                const runtime = comp.runtime


                if (runtime) {

                    comp.extends =  runtime.extends && _.find(resources, {runtime: runtime.extends});

                    if (runtime.extends && !comp.extends) {
                        console.warn('could not link extend on: ' + comp.name);

                        comp.extends = _.findKey(resources, {runtime: runtime.extends});

                        if (!comp.extends) {
                            console.warn('could not find extend on: ' + comp.name);
                        }
                    }

                    comp.mixins = [];

                    //resolve mixins
                    _.forEach(runtime.mixins, (mixin, index) => {
                        const definition = _.find(resources, res => {
                            return res.runtime === mixin;
                        });

                        const name = definition && definition.resource;

                        // if(!name) {
                        //     console.warn('could not find mixin ' + index + ' in: ' + comp.name);
                        // }
                        if(!definition) {
                            console.warn('could not link/find  mixin ' + (name || index) + ' for: ' + comp.name);
                        }

                        comp.mixins.push({name, linked: !!definition});

                    });

                    //merge inherited props, methods, computeds  to component
                    ['props', 'methods', 'computed'].forEach(type => {

                        const res = {};

                        const inheritanceChain = comp.extends ? [comp.extends] : [];

                        [...inheritanceChain, ...comp.mixins].forEach((desc) => {
                            if (desc) {

                                const def = resources[desc.name];
                                if(def) {
                                    _.assign(res, _.mapValues(def.component[type], member => ({...member, inherited: !!desc, _style : {...member._style, 'font-style': 'italic'}})));
                                }
                                if(desc.linked !== !!def) {
                                    debugger
                                }

                            } else {
                                debugger;
                            }
                        });

                        _.assign(res, comp.component[type]);

                        //find prop defaults again, as default may change in inherited type
                        util.findPropDefaults(res, comp.runtime);

                        comp.component[type] = res;

                    });

                }

            });
        });
        // this.linked = true;
    }


    createCompiler(filename = this.indexFile) {

        const conf = this.adaptConfig(filename);

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

        console.log('watching package:', this.pack.name);

        // ignored: '**/*'
        if(this.pack.config.watch) {
            this.watcher = compiler.watch({}, (...args) => this.onWebPack(...args));
        } else {
            this.watcher = compiler.run((...args) => this.onWebPack(...args));
        }
    }

    onWebPack(err, res) {
        const resfname = Object.keys(res.compilation.assets)[0];
        const script = this.outputFileSystem.readFileSync(resfname ,'utf8');
        try {
            browser.install();
            const rt = requireFromString(script);
            browser.clear();

            this.cache = rt.default ? rt.default : rt;
            this.emit('change', this.cache);
            // resolve(rt.default ? rt.default : rt);
            console.log('webpack built');
        } catch(e) {
            console.warn('could not load runtime');
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
                        console.log('webpacked:', filename);
                    } catch(e) {
                        console.warn('could not load runtime for:', filename);
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