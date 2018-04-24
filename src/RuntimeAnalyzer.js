const {EventEmitter} = require('events');
const util = require('./util');
const fs = require('fs');
const tempfile = require('tempfile');
const _ = require('lodash');
const webpack = require('webpack');
const MemFs = require('memory-fs');
const requireFromString = require('require-from-string');
const browser = require('./Browser');

module.exports = class RuntimeAnalyzer extends EventEmitter {

    constructor(pack) {

        super();
        this.pack = pack;
        this.indexFile = tempfile('.js');

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
        const compiler = webpack(conf);

        compiler.outputFileSystem = new MemFs;

        return compiler;

    }

    writeIndex() {

        const {pack} = this;

        const files = _.filter(pack.resources, res => res.type !== 'package');

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
                this.once('change', resolve);
            })
        }

    }

    watch() {

        this.writeIndex();

        const compiler = this.createCompiler(this.indexFile);

        compiler.inputFileSystem = compiler.inputFileSystem;

        console.log('watching package:', this.pack.name);

        compiler.watch({ignored: '**/*'}, (err, res) => {
            const resfname = Object.keys(res.compilation.assets)[0];
            const data = compiler.outputFileSystem.readFileSync(resfname ,'utf8');
            try {
                browser.install();
                const rt = requireFromString(data);
                browser.clear();

                this.cache = rt.default ? rt.default : rt;
                this.emit('change', this.cache);
                // resolve(rt.default ? rt.default : rt);
                console.log('runtime changed');
            } catch(e) {
                console.warn('could not load runtime');
                // resolve({});
            }
        });
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