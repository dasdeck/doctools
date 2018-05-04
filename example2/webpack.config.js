/* eslint-env node */
const DoctoolsWebpack = require('../src/DoctoolsWebpack');

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

    plugins: [new DoctoolsWebpack()],

    externals: {
        'vue': 'Vue'
        // 'uikit': 'UIkit'
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