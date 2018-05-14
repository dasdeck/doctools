const _ = require('lodash');
const jsdoc = require('jsdoc-api');
const Plugin = require('../Plugin');
const util = require('../util');
const fs = require('fs');
const path = require('path');

class PackageMapper extends Plugin {

    constructor(config = PackageMapper.defaultConfig) {
        super();
        this.config = config;
    }

    onSerialize(desc, data) {
        if (desc.type === 'package') {

            _.assign(data, _.pick(desc, ['global', 'description', 'type', 'packages', 'resources']));

        }
    }

    onGet(app, data) {
        const packages = _.sortBy(_.filter(app.resources, res => res.type === 'package'), desc => desc.path.length);
        data.rootPackage = packages.length && _.first(packages).resource;
    }

    /**
     * maps the jsdoc list to a sorted structure
     * @param {*} all
     * @param {*} config
     */
    onMap(app) {

        const packages = _.sortBy(_.filter(app.resources, res => res.type === 'package'), desc => -desc.path.length);
        // const resources = _.filter(desc.app.resources, res => res.type !== 'package'));


        _.forEach(app.resources, res => {

            _.some(packages, pack => {

                const packDir = path.dirname(pack.path);

                if(pack !== res && _.startsWith(res.path, packDir)) {
                    res.package = pack.resource;
                    if (res.type === 'package') {
                        pack.packages = pack.packages || {};
                        pack.packages[res.resource] = res.resource;
                    } else {
                        pack.resources = pack.resources || {};
                        pack.resources[res.resource] = res.resource;
                    }
                    return true;
                }
            })

        })

        _.forEach(packages, pack => {

        })

    }

    //TODO
    findMain(pack) {

        if (pack.packageJson.main) {

            const pathToMain = path.resolve(path.join(this.path, this.packageJson.main));
            this.getPackageModules().forEach(res => {
                if (pathToMain === path.resolve(res.path)) {

                    this.main = res.resource;
                }
            });
        }
    }

};

PackageMapper.defaultConfig = {
    getAssets(desc) {
        return {readme: path.join(path.dirname(desc.path), 'README.md')};
    }
}

module.exports = PackageMapper;