const _ = require('lodash');
const fs = require('fs');
const util = require('../util');
const path = require('path');
const Loader = require('../Loader');
// const Package = require('../Package');

class PackageLoader extends Loader {


    match(file) {
        return path.basename(file) === 'package.json';
    }

    // getPackageFile(dir) {
    //     return path.resolve(path.join(dir, 'package.json'));
    // }

    load(file, desc) {

        const app = desc.app;

        desc.watchAsset(file, (watcher, module) => {
            module.packageJson = JSON.parse(fs.readFileSync(file));
            module.name = module.packageJson.name;
        });
        // desc.watchAsset(path.join(file, 'READEME.md'), 'readme');
//
        // app.scanDirectory(file, desc);

        desc.type = 'package';


    }

    // createModule(app, file , parent) {
    //     return new Package(app, file, parent, this);
    // }



}

module.exports = PackageLoader;