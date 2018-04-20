/* eslint-env node */

module.exports = {

    context: __dirname,

    entry: {
        'index': './index.js'
    },

    output: {
        path: __dirname,
        filename: '[name].min.js',
        publicPath: '/',
        hotUpdateChunkFilename: 'hot/[hash].hot-update.js', // fix ids with slashes
        hotUpdateMainFilename: 'hot/[hash].hot-update.json'
    },

    devServer: require('../devServer'),

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
    }
};