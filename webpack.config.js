/* eslint-env node */

const glob = require('glob');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const packageParser = require('./src/packageParser');
const webpack = require('webpack');
const MemFs = require('memory-fs');
const requireFromString = require('require-from-string');



function webpackFile(config, filename) {
    const runtime = require(config.runtime);

    const compiler = webpack({
        ...runtime,
        entry: {
            [filename]: filename
        },
        output: {
            libraryTarget: 'commonjs'
        }
    });

    compiler.outputFileSystem = new MemFs;

    return new Promise(resolve => {

        compiler.run((err, res) => {
            const data = compiler.outputFileSystem.readFileSync(Object.keys(res.compilation.assets)[0] ,'utf8');
            const rt = requireFromString(data);
            resolve(rt);
        });
    });
}

const devServer = {

    historyApiFallback: {
        index: 'ui/index.html',
    },
    contentBase: [__dirname, 'examples', 'src'],
    watchContentBase: true,
    inline: true,
    before(app) {

        console.log('building docs...');

        const parser = require(__dirname + '/src/parser');
        const config = parser.prepareConfig(global.doctoolsConfig);

        let data;

        if (config.watch) {
            const watchedFiles = packageParser.Package.getIncludedFiles(config);

            fs.watch(config.base, {recursive: true}, (eventType, filename) => {
                filename = path.join(config.base, filename);
                if (watchedFiles.includes(filename)) {

                    if (_.isString(config.runtime)) {

                        webpackFile(config, filename).then(desc => {
                            debugger;
                            if (data instanceof packageParser.Package) {
                                debugger;
                                // data(patch());
                            }
                        });
                    }

                    console.log(filename, 'changed!!');

                }
            });
        }

        app.get('/data.json', (req, res, next) => {

            if(!data || config.developMode) {

                if (config.developMode) {

                    console.log('re-parsing whole docu');

                    glob.sync(__dirname + '/src/*.js').forEach(file => {
                        delete require.cache[require.resolve(file)];
                    });

                }
                data = parser.parse(config);
            }

            console.log(app);
            console.log('serving data.json', config);

            res.json(data.serialize());

            next();
        });

    }
};

const ui = {

    context: __dirname,

    entry: {
        'index': './ui/index.js'
    },

    devServer,

    output: {
        path: __dirname,
        filename: '[name].min.js',
        publicPath: '/',
        hotUpdateChunkFilename: 'hot/[hash].hot-update.js', // fix ids with slashes
        hotUpdateMainFilename: 'hot/[hash].hot-update.json'
    },

    mode: 'development',

    externals: {
        'vue': 'Vue',
        'uikit': 'UIkit'
    },

    module: {
        rules: [
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader'
                }
            },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
};

const configs = [ui];

module.exports = configs;