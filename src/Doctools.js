module.exports = class DocTools {

    constructor() {

        this.files = {};
        this.resources = {};
    }

    parse(config = {}) {
        this.config = config;

        this.scanFile(this.config.base);

        this.execPluginCallback('onMap');

    }

    execPluginCallback(name, module = null , data = null, sync = false) {

        if (!this.config._) {
            // debugger;
        }

        const jobs = this.config._.plugins.map(plugin => {
            return () => plugin.matchesType(module, name) && plugin[name] && plugin[name](module, data) || Promise.resolve();
        });

        if (sync) {
            jobs.forEach(job => {
                job();
            });
        } else {
            return jobs.reduce(function(p, fn) {
                return p = p.then(fn);
            }, Promise.resolve());

        }

        // return Promise.all(jobs);
    }

    scanFile(file) {

        if (!util.match(pack.config, file)) {
            pack.log('skipping file:', file);
            return;
        }

        pack.log('seeking files in:', file);

        const module = pack.app.loadFile(file, pack);

        if (module) {

            pack && pack.addChild(module);

        }


        if(fs.lstatSync(file).isDirectory()) {

            this.scanDirectory(file, pack);

        }

        return module;

    }

    scanDirectory(directory) {

        fs.readdirSync(directory).forEach(file => {

            file = path.resolve(path.join(directory, file));

            this.scanFile(file, pack);

        })

    }

    loadFile(file) {

        const existing = this.files[file];

        if (existing) {

            throw file + ' already loaded!';
        }

        this.files[file] = file;

        for(const loader of this.config._.loaders) {

            if (loader.match(file)) {

                const module = loader.createModule && loader.createModule(this, file, pack)
                    || new Module(this, file , pack, loader);


                if (this.resources[module.resource]) {
                    throw 'module resource uri ' + module.resource + ' already existing'
                }

                this.resources[module.resource] = module;

                return module;

            }
        }
    }


}