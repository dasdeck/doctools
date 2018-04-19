/* eslint-env node */

const glob = require('glob');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const packageParser = require('./src/packageParser');

const config = global.doctoolsConfig;

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
        let data = parser.parse(config);

        if (config.watch && data instanceof packageParser.Package) {
            const watchedFiles = packageParser.Package.getIncludedFiles(config);

            fs.watch(config.base, {recursive: true}, (eventType, filename) => {
                filename = path.join(config.base, filename);
                if (watchedFiles.includes(filename)) {
                    console.log(filename, 'changed!!');

                }
            });
        }

        app.get('/data.json', (req, res, next) => {

            if (config.developMode) {

                console.log('re-parsing whole docu');

                glob.sync(__dirname + '/src/*.js').forEach(file => {
                    delete require.cache[require.resolve(file)];
                });

                const parser = require(__dirname + '/src/parser');
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

if (_.isString(config.runtime)) {
    const runtime = require(config.runtime);

    packageParser.Package.getIncludedFiles(config).forEach(file => {

        if(file.includes('.vue'))
        configs.push({
            ...runtime,
            entry: {
                [file]: file
            },
            output: {
                path: process.cwd() + '/runtime',
                filename: '[name].runtime'
            }
        })
    });

}

module.exports = configs;