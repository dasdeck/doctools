const _ = require('lodash');
const {findPropDefaults} = require('./util');
const path = require('path');
const fs = require('fs');
const glob = require('glob');

class Package {

    constructor(config) {

        const dir = config.base;
        this.config = config;

        this.dir = dir;
        this.name = dir.split('/').pop();

        this.type = 'package';

        this.init();
        this.createLinks();
    }

    init() {

        const packPath = path.join(this.dir, 'package.json');
        if (fs.existsSync(packPath)) {
            this.packageJson = require(packPath);
        }

        this.globals = {
            trigger: []
        };

        this.modules = {};

        const files = Package.getIncludedFiles(this.config);
        files.forEach(file => {

            const parser = require('./parser');
            const res = parser.parse(file);

            if (!res.ignore) {
                this.addModule(res);
            }

        });

    }

    addModule(module) {

        this.modules[module.type] = this.modules[module.type] || {};
        this.modules[module.type][module.name] = module;

        _.forEach(module.trigger, trigger => {
            trigger.source = module.name;
            this.globals.trigger.push(trigger);
        });
    }

    patch(module) {
        this.addModule(module);
        this.createLinks();
    }

    createLinks() {

        const linkedModules = {};

        ['UIkitComponent', 'VueComponent', 'module'].forEach(type => {


            const registry = linkedModules[type] = _.cloneDeep(this.modules[type]);

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

        _.assign(this, linkedModules);
    }
}

Package.getIncludedFiles = function(config) {
    return glob.sync(path.join(config.base, config.search || '**/*.+(js|vue)'));
};

module.exports = {

    Package,



    /**
     *
     * @param {Object} config
     * @param {String} config.base - package directory
     * @param {String} [config.search = '** /*.+(js|vue)'] - glob of files to document for this package (default value pseudo escaped)
     * @param {String} [config.subpackage] - glob of sub-packages to recursively inlcude document
     */
    analyzePackage(config) {
        return new Package(config);

    }
};