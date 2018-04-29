/* eslint-env node */

const rules = [
    {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
    },
    {
        test: /\.vue$/,
        use: ['vue-loader']
    },
    {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
    }
];

const externals = {
    'vue': 'Vue',
    'uikit': 'UIkit'
};

const output = {
    path: __dirname,
    filename: '[name].min.js',
    publicPath: '/',
    hotUpdateChunkFilename: 'hot/[hash].hot-update.js', // fix ids with slashes
    hotUpdateMainFilename: 'hot/[hash].hot-update.json'
};

const devServer = require('../devServer');

const base = {

    context: __dirname,

    entry: {
        'index': './index.js'
    },

    output,

    devServer,

    mode: 'development',
    
    devtool: 'inline-sourcemap',

    externals,

    module: {
        rules
    }
};

const MarkdownExporter = {
    ...base,
    output: {
        ...output,
        libraryTarget: 'commonjs'
    },

    entry: {
        'MarkdownAdapter': './MarkdownAdapter.js'
    },

    externals: undefined
}

module.exports = [base, MarkdownExporter];