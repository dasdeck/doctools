// const _ = require('lodash');
// const uikitShim = require('../src/uikitShims');

// uikitShim.registerGlobal();
// uikitShim.install();
// const runtime = require('./index.min');
// uikitShim.clear();

// runtime.UIkitComponent = {..._.mapValues(UIkit.components, comp => comp.options), ...UIkit.mixin};
/* eslint-env node */
module.exports = {
    base: __dirname,
    search: 'src/**/*.+(js|vue)',
    developMode: false,
    runtime: __dirname + '/webpack.config.js',
    // subPackages: 'packages/*',
    subPackages: true,
    watch: true
    // runtime
};