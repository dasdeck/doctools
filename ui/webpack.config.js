/* eslint-env node */
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const rules = [
    {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
    },
    {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
            compilerOptions: {
                preserveWhitespace: false
            },
            transformAssetUrls: {},
            loaders: {
              js: "babel-loader"
            }
          }
    },
    {
        test: /\.svg$/,
        loader: 'raw-loader'
    },
    {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
    }
];

const externals = {
    'vue': 'Vue',
    'uikit': "UIkit"
};

const output = {
    path: __dirname,
    filename: '[name].min.js',
    publicPath: '/',
    hotUpdateChunkFilename: 'hot/[hash].hot-update.js', // fix ids with slashes
    hotUpdateMainFilename: 'hot/[hash].hot-update.json'
};

// const DevServer = require('../src/plugins/DevServerPlugin');

const base = {

    context: __dirname,

    entry: {
        'index': './index.js'
    },

    output,

    // devServer: DevServer.webPackConfig,

    mode: 'development',

    plugins: [
        new VueLoaderPlugin
    ],

    devtool: 'inline-sourcemap',

    externals,

    module: {
        rules
    }
};


module.exports = base;