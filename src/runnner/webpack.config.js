/* eslint-env node */
const rules = [
    {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
    }
];

const externals = {
    vue: 'Vue',
    uikit: 'UIkit'
};

const output = {
    libraryTarget: 'commonjs',
    path: __dirname,
    filename: '[name].min.js',
};

const MarkdownAdapter = {
    context: __dirname,

    mode: 'development',

    externals,

    target: 'node',

    devtool: 'inline-source-map',

    module: {
        rules
    },
    output,
    entry: {
        UIkitRunner: './UIkitRunner.js',
        VueRunner: './VueRunner.js'
    }
};

module.exports = MarkdownAdapter;