
module.exports = {
    analyzePackage(name, search = 'src/**/*.+(js|vue)') {

        const path = require('path');
        const packageJson = require(path.join(name, 'package.json'));
        const pack = {
            name,
            trigger: [],
            packageJson
        };

        const globPath = path.join(name, search);

        const glob = require('glob');
        glob.sync(globPath).forEach(file => {

            const parser = require('./parser');
            const res = parser.parse(file);
            pack[res.type] = pack[res.type] || {};
            pack[res.type][res.name] = res;

            const _ = require('lodash');
            _.forEach(res.trigger, trigger => {
                trigger.source = res;
                pack.trigger.push(trigger);
            });

        });

        return pack;

    }
}