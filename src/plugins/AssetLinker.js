const _ = require('lodash');
const path = require('path');
const Plugin = require('../Plugin');

class AssetLinker extends Plugin {

    constructor(config = AssetLinker.defaultConfig) {
        super();
        this.config = config;
    }

    onSerialize(desc, data) {
        _.assign(data, _.pick(desc, ['assets', 'isAsset']));
    }

    onLink(app) {
        if (this.config.getAssets) {

            const resources = app.resources;

            const files = _.reduce(resources, (res, mod) =>  {
                res[mod.path] = mod.resource;
                return res;
            }, {})

            _.forEach(resources, resource => {
                const assets = this.config.getAssets(resource);
                _.forEach(assets, (file, name) => {

                    const assetsResource = files[file];

                    if (assetsResource && assetsResource !== resource.resource) {

                        const assetModule = resources[assetsResource];
                        assetModule.isAsset = true;

                        resource.assets = resource.assets || {};
                        resource.assets[name] = this.config.inline ? assetModule : assetsResource;

                    }
                });
            });
        }
    }
};

AssetLinker.defaultConfig = {

    inline: false,

    getAssets(desc) {

        switch (desc.type) {

        case 'package':

            return {
                readme: path.join(path.dirname(desc.path),  'README.md')
            };

            break;

        default:
            return {
                readme: desc.path + '.md'
            };

        }
    }
}

module.exports = AssetLinker;