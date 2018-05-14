const _ = require('lodash');
const fs = require('fs');
const util = require('../util');
const path = require('path');
const Loader = require('../Loader');

class PackageLoader extends Loader {


    match(file) {
        return path.basename(file) === 'package.json';
    }

    load(file, desc) {

        const app = desc.app;

        desc.watchAsset(file, (watcher, module) => {
            module.packageJson = JSON.parse(fs.readFileSync(file));
            module.name = module.packageJson.name;
        });

        desc.type = 'package';

    }

}

module.exports = PackageLoader;