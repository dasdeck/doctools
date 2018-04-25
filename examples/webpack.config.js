/* eslint-env node */
const DocToolsWebpack = require('../src/DocToolsWebpack');

module.exports = {

    context: __dirname,

    entry: {
        'index': './index.js'
    },

    target: 'node',

    output: {
        libraryTarget: 'commonjs',
        path: __dirname,
        filename: '[name].min.js',
    },

    mode: 'development',

    plugins: [new DocToolsWebpack()],

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