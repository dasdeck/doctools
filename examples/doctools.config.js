
const _ = require('lodash');
const DefaultLoader = require('../src/loaders/DefaultLoader');

/* eslint-env node */
module.exports = {

    watch: false,

    include: [/src/, /packages/],

    runtime: __dirname + '/webpack.config.js',

    loaders: [
        new DefaultLoader({
            include: ['accordion.js', 'togglable.js' ],
            type: 'UIkitComponent',
            desc: {runtime: true}
        }),
        'MarkdownLoader',
        'DefaultLoader',
        'VueLoader'
    ],
    menu: [
        {
            label: 'Packages',
            items: (pack) => _.filter(pack.getResources(), desc => desc.type === 'package')
        },
        {
            label: 'VueComponents',
            items: (pack) => _.filter(pack.getResources(), desc => desc.type === 'VueComponent')
        },
        {
            label: 'UIkitComponents',
            items: (pack) => _.filter(pack.getResources(), desc => desc.type === 'UIkitComponent')
        },
        {
            label: 'Modules',
            items: (pack) => _.filter(pack.getResources(), desc => desc.type === 'module')
        }
    ]
};