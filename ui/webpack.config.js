/* eslint-env node */

const rules = [
    {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
    },
    {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
            loaders: {
              js: "babel-loader"
            }
          }
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

const DevServer = require('../src/DevServer');

const base = {

    context: __dirname,

    entry: {
        'index': './index.js'
    },

    output,

    devServer: DevServer.webPackConfig,

    mode: 'development',

    devtool: 'inline-sourcemap',

    externals,

    module: {
        rules
    }
};

const MarkdownAdapter = {
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


module.exports = [base, MarkdownAdapter];