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
    libraryTarget: 'commonjs',
    path: __dirname,
    filename: '[name].min.js',
    publicPath: '/',
    hotUpdateChunkFilename: 'hot/[hash].hot-update.js', // fix ids with slashes
    hotUpdateMainFilename: 'hot/[hash].hot-update.json'
};

const MarkdownAdapter = {
    context: __dirname,

    mode: 'development',

    externals,

    devtool: 'inline-source-map',

    plugins: [
        new VueLoaderPlugin
    ],
    module: {
        rules
    },
    output,
    entry: {
        'MarkdownAdapter': './MarkdownAdapter.js'
    }

}

module.exports = MarkdownAdapter;