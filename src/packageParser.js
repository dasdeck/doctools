const _ = require('lodash');
const util = require('./util');
const path = require('path');
const fs = require('fs');
const glob = require('glob');

/**
 * the Package parser
 */
class Package {

    constructor(config) {

        const dir = config.base;
        this.config = config;

        this.dir = dir;
        this.name = dir.split('/').pop();

        this.type = 'package';

        this.resource = this.package = this.dir.replace(config.resourceBase, '').replace(/\//g, '.').substr(1);

        this.resources = {};
        this.modules = {};

        if (config.subPackages){
            console.log('using subpackages:', config.subPackages);

            this.subPackages = {};
            glob.sync(path.join(this.dir, config.subPackages)).forEach(subPackage => {

                const parser = require('./parser');

                const res = parser.parse({...config, base:subPackage});


                this.resources[res.resource] = res;
                Object.assign(this.resources, res.resources);
                delete res.resources;

                this.subPackages[subPackage.split('/').pop()] = res.resource;



            });

        }

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

        const files = Package.getIncludedFiles(this.config);
        files.forEach(file => {

            const parser = require('./parser');
            const res = parser.parse({...this.config, base:file, package: this});

            if (!res.ignore) {
                this.addModule(res);
            }
        });

    }

    addModule(module) {

        const resource = module.resource;

        this.resources[resource] = module;

        this.modules[module.type] = this.modules[module.type] || {};
        this.modules[module.type][module.name] = resource;//module;

        const {mapParams} = require('./moduleParser');
        _.forEach(module.trigger, trigger => {
            trigger.source = module.name;

            trigger.simpleName = trigger.name;
            mapParams(trigger);
            this.globals.trigger.push(trigger);
        });
    }

    patch(module) {
        this.addModule(module);
        this.createLinks();
    }

    serialize() {

        return {...this, config: undefined};

    }

    findDefinitionName(type, runtime) {
        return this.config.runtime && this.config.runtime[type] && _.findKey(this.config.runtime[type], runtime);
    }

    createLinks(resource = this.resources) {

        const linkedModules = {};

        this.config.types.forEach(type => {


            const registry = linkedModules[type] = _.cloneDeep(this.modules[type]);

            _.forEach(registry, resource => {

                const comp = this.resources[resource];

                comp.fileInPackage = comp.file.replace(this.dir, '.');

                if (this.packageJson && this.packageJson.main && path.resolve(path.join(this.dir, this.packageJson.main)) === path.resolve(comp.file)) {
                    this.main = comp;
                }

                const runtime = comp.runtime;
                if (runtime) {

                    // delete comp.runtime;

                    comp.extends =  runtime.extends && _.find(registry, ['runtime', runtime.extends]);

                    if (runtime.extends && !comp.extends) {
                        console.warn('could not link extend on: ' + comp.name);

                        comp.extends = this.findDefinitionName(runtime.extends);

                        if (!comp.extends) {
                            console.warn('could not find extend on: ' + comp.name);
                        }
                    }



                    comp.mixins = [];


                    //resolve mixins
                    _.forEach(runtime.mixins, (mixin, index) => {
                        const definition = mixin && _.find(registry, ['runtime', mixin]);

                        const name = mixin && this.findDefinitionName(type, mixin);
                        if(!name) {
                            console.warn('could not find mixin ' + index + ' in: ' + comp.name);
                        }
                        if(!definition) {
                            console.warn('could not link  mixin ' + (name || index) + ' for: ' + comp.name);
                        }

                        comp.mixins.push({name, linked: !!definition});

                    });


                    //merge inherited props, methods, computeds  to component
                    ['props', 'methods', 'computed'].forEach(type => {

                        const res = {};

                        const inheritanceChain = comp.extends ? [comp.extends] : [];


                        [...inheritanceChain, ...comp.mixins].forEach((desc) => {
                            if (desc) {

                                const def = registry[desc.name];
                                if(def) {
                                    _.assign(res, _.mapValues(def[type], member => ({...member, inherited: desc, _style : {...member._style, 'font-style': 'italic'}})));
                                }
                                if(desc.linked !== !!def) {
                                    debugger
                                }

                            } else {
                                debugger;
                            }
                        });

                        _.assign(res, comp[type]);

                        //find prop defaults again, as default may change in inherited type
                        util.findPropDefaults(res, comp.runtime);

                        comp[type] = res;

                    })

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
     * @private
     * @param {DoctoolsConfig} config
     */
    analyzePackage(config) {
        return new Package(config);

    }
};