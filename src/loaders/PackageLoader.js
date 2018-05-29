const path = require('path');
const Loader = require('../Loader');

class PackageLoader extends Loader {

    match(file) {
        return path.basename(file) === 'package.json';
    }

    load(source, desc) {

        desc.packageJson = JSON.parse(source);
        desc.name = desc.packageJson.name;

        desc.type = 'package';

    }

}

module.exports = PackageLoader;