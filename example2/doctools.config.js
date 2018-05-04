// const _ = require('lodash');
// const uikitShim = require('../src/uikitShims');

// uikitShim.registerGlobal();
// uikitShim.install();
// const runtime = require('./index.min');
// uikitShim.clear();

// runtime.UIkitComponent = {..._.mapValues(UIkit.components, comp => comp.options), ...UIkit.mixin};

/* eslint-env node */
module.exports = {
    include: [/src/, /packages/],
    runtime: __dirname + '/webpack.config.js',
    menu: [
        {
            label: 'Packages',
            match: (file, desc) => desc.type === 'package'
        },
        {
            label: 'VueComponents',
            match: (file, desc) => desc.type === 'VueComponent'
        },
        {
            label: 'UIkitComponents',
            match: (file, desc) => desc.type === 'UIkitComponent'
        },
        {
            label: 'Modules',
            match: (file, desc) => desc.type === 'module'
        }
    ]
};