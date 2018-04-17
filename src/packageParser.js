
const _ = require('lodash');
const {findPropDefaults} = require('./util');
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

            if (res.ignore) {
                return;
            }
            pack[res.type] = pack[res.type] || {};
            pack[res.type][res.name] = res;

            const _ = require('lodash');
            _.forEach(res.trigger, trigger => {
                trigger.source = res.name;
                pack.trigger.push(trigger);
            });

            //connect inheritance

        });

        ['UIkitComponent'].forEach(type => {

            const registry = pack[type];

            _.forEach(registry, comp => {

                const runtime = comp.runtime;
                if (runtime) {

                    comp.extends =  _.find(registry, ['runtime', runtime.extends]);

                    if (runtime.extends && !comp.extends) {
                        console.warn('could not link extend on: ' + comp.name);
                    }

                    comp.mixins = _.filter(
                            _.map(
                                _.map(runtime.mixins, mixin => _.find(registry, ['runtime', mixin])),
                                mixin => mixin && mixin.name, mixin => mixin));

                    if (runtime.mixins && runtime.mixins.length !== comp.mixins.length) {
                        console.warn('could not link all mixins on: ' + comp.name);
                    }

                    const props = {};


                    [comp.extends, ...comp.mixins].forEach(name => {
                        if (name) {
                            const def = registry[name];
                            _.assign(props, _.mapValues(def.props, prop => ({...prop, inherited: name, _style : {...prop._style, 'font-style': 'italic'}})));
                        }
                    });

                    _.assign(props, comp.props);

                    //find prop defaults again, as default may change in inherited type
                    findPropDefaults(props, comp.runtime);

                    comp.props = props;

                }

            });
        });

        return pack;

    }
};