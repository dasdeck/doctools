/* eslint-env node */

const glob = require('glob');
const _ = require('lodash');

const devServer = {

    contentBase: __dirname,
    watchContentBase: true,
    before(app) {

        app.get('/data.json', (req, res, next) => {

            glob.sync('./src/*.js').forEach(file => {
                delete require.cache[require.resolve(file)];
            });

            const parser = require('./src/parser');
            const data = parser.parse('./examples');

            console.log('req data.json')
            res.json(data);
            next();
        });

    }
};

module.exports = {

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