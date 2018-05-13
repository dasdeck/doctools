const _ = require('lodash');
const path = require('path');
const Plugin = require('../Plugin');

class ModuleMapper extends Plugin {

    constructor(config = ModuleMapper.defaultConfig) {
        super();
        this.config = config;
    }


    onLink(app) {
        if (this.config.getAssets) {

            // const module = data.files
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
                        resource.assets[name] = assetsResource;

                   }

               })
            });
        }
        // debugger
    }

};

ModuleMapper.defaultConfig = {
    getAssets(desc) {
        switch(desc.type) {
            case 'package': {
                return {
                    readme: path.join(path.dirname(desc.path),  'README.md')
                };
                break;
            }
            default: {
                return {readme: desc.path + '.md'};
            }
        }
    }
}

module.exports = ModuleMapper;