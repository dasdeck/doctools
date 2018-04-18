const uikitShim = require('../src/uikitShims');
UIkit = uikitShim.get();
uikitShim.install();
const runtime = require('./index.min');
uikitShim.clear();
const _ = require('lodash');

runtime.UIkitComponent = {..._.mapValues(UIkit.components, comp => comp.options), ...UIkit.mixin};

module.exports = {
    base: __dirname,
    search: 'src/**/*.+(js|vue)',
    developMode: true,
    runtime
};