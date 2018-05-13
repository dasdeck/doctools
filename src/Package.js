const _ = require('lodash');
const util = require('./util');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const TreeItem = require('./TreeItem');
const Module = require('./Module');
const defaultConfig = require('./Config');
const mkpath = require('mkpath');

/**
 * the Package parser
 */
module.exports = class Package extends TreeItem {


    createMenu(children = this.config.menu, resources = this.getResources()) {
        const res = [];

        return _.reduce(children, (res, child, key) => {

            const entry = {
                ...child,
                label: child.label || key,
            }

            if (_.isFunction(child.items)) {

                entry.items = _.reduce(child.items(this), (res, val) => {
                    res[val.resource] = val.name;
                    return res;
                }, {});

            }

            res[key] = entry;

            return res;

        }, {});

    }

    get() {

        const menu = this.config.menu ? this.createMenu(this.config.menu) : null;

        const data = {
            menu,
            config: _.pick(this.config, ['menus']),
            rootPackage: this.resource
        };

        this.execPluginCallback('onGet', data, true);

        return data;
    }

    write() {

        const data = this.get();

        this.execPluginCallback('onWrite', data, true);

        if (this.config.output) {

            if (this.config.output.split === true) {

                mkpath.sync(this.config.output.path);

                const p = this.resolvePath(this.config.output.path);
                fs.writeFileSync(path.join(p, '_menu.json'), JSON.stringify(data.menu, null, 2));
                fs.writeFileSync(path.join(p, '_index.json'), JSON.stringify(_.mapValues(data.resources, res => res.name), null, 2));

                _.forEach(data.resources, module => {
                    fs.writeFileSync(path.join(p, `${module.resource}.json`), JSON.stringify(module, null, 2));
                });


            } else {

                const p = this.config.output.path || this.config.output;
                fs.writeFileSync(this.resolvePath(p), JSON.stringify(data, null, 2));

            }
        }

        return Promise.resolve(data);
    }


}
