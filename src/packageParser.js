
module.exports = {
    analyzePackage(dir, search = '**/*.+(js|vue)') {

        const path = require('path');
        const packPath = path.join(dir, 'package.json');
        const fs = require('fs');
        let packageJson;
        if (fs.existsSync(packPath)) {
            packageJson = require();
        }

        const name = dir.split('/').pop();

        const pack = {
            name,
            trigger: [],
            packageJson
        };

        const globPath = path.join(name, search);

        const glob = require('glob');
        const files = glob.sync(globPath);
        files.forEach(file => {

            const parser = require('./parser');
            const res = parser.parse(file);

            if (res.type === 'module' && !res.functions.length && !res.constants.length) {
                return;
            }
            pack[res.type] = pack[res.type] || {};
            pack[res.type][res.name] = res;

            const _ = require('lodash');
            _.forEach(res.trigger, trigger => {
                trigger.source = res.name;
                pack.trigger.push(trigger);
            });

        });

        return pack;

    }
}