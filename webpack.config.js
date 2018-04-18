/* eslint-env node */

const glob = require('glob');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const packageParser = require('./src/packageParser');

const devServer = {

    contentBase: [__dirname, 'examples', 'src'],
    watchContentBase: true,
    inline: true,
    before(app) {

        const config = global.doctoolsConfig || {base: './examples'};
        // console.log("dev-server-pwd", process.cwd(), global.doctoolsConfig);

        console.log('building docs...');

        const parser = require(__dirname + '/src/parser');
        let data = parser.parse(config);

        if (config.watch && data instanceof packageParser.Package) {
            const watchedFiles = packageParser.Package.getIncludedFiles(config);

            fs.watch(config.base, {encoding: 'buffer'}, (eventType, filename) => {

                if (watchedFiles.includes(filename)) {
                    console.log(filename, 'changed!!');
                }
            });
        }

        app.get('/data.json', (req, res, next) => {

            if (config.developMode) {

                console.log('repasring whole docu');

                glob.sync(__dirname + '/src/*.js').forEach(file => {
                    delete require.cache[require.resolve(file)];
                });

                const parser = require(__dirname + '/src/parser');
                data = parser.parse(config);
            }

            console.log('req data.json', config);

            res.json(data);

            next();
        });

    }
};

module.exports = {

    context: __dirname,

    entry: {
        index: './index.js'
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
        'vue': 'Vue'
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