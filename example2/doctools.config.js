

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