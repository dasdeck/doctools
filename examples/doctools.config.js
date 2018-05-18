
const _ = require('lodash');
const DefaultLoader = require('../src/loaders/DefaultLoader');
const AssetLinker = require('../src/plugins/AssetLinker');

/* eslint-env node */
module.exports = {

    watch: false,

    include: ['@(src|packages)/**/*', '@(package.json|README.md)', 'docs/*.md'],

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

    plugins: [
        // 'RuntimeAnalyzer',
        'ModuleMapper',
        'UIkitComponentMapper',
        'VueComponentMapper',
        'ComponentLinker',

        new AssetLinker({

            getAssets(desc) {

                const assets = AssetLinker.defaultConfig.getAssets(desc);
                if (desc.component && desc.component.tutorials) {

                    desc.component.tutorials.forEach(tut => {

                        const res = _.find(desc.app.resources, res => res.type === 'markdown' && res.name === tut);
                        if (res) {
                            assets[`tutorial:${tut}`] = res.path;

                        } else {
                            desc.app.log('could not find tutorial:', tut);
                        }

                    });
                }

                return assets;

            }
        })

        // 'HTMLExporter',
        // 'VuePressExporter',
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