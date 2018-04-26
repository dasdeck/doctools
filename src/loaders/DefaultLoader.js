const _ = require('lodash');
const fs = require('fs');

module.exports = class DefaultLoader {

    match(file) {
        return _.endsWith(file, '.js');
    }

    load(file) {
        return {script: fs.readFileSync(file, 'utf8')};
    }


}