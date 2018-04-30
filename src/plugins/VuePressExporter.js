const Plugin = require('../Plugin');
const path = require('path');
const fs = require('fs');
const mkpath = require('mkpath');
const _ = require('lodash');

/**
 * attemts to load the described class
 * mark module for runtime analysis by setting a member runtime = true
 */
module.exports = class MarkdownExporter extends Plugin {

    onConstruct(pack) {
    }

    getResourceSidebarEntry(res, write = true) {
        const dir = this.getDir();
        const filename = res.resource.replace(/\./g, '-') + '.md';
        const file = path.join(dir, filename);

        let changed;
        try {
            changed = fs.readFileSync(file, 'utf8') !== res.markdown;
        } catch(e) {
            changed = true;
        } finally {
            if (changed) {
                fs.writeFileSync(file, res.markdown);
            }
        }

        return [filename, res.name];
    }
    /**
     *
     * @param {Package} pack
     */
    getSideBar() {

        const packages = _.filter(this.pack.getResources(), res => res.type === 'package');

        return _.map(packages, pack => {

            const resources = _.filter(pack.getPackageModules(), res => res.markdown);
            return {

                title: pack.name,
                children: _.map(resources, res => this.getResourceSidebarEntry(res))
            };

        });

    }

    getDir(pack) {
        return path.join(this.pack.config.base, 'vuepress');
    }
    /**
     * helper function to load the runtime for a component or module
     * @param {*} config
     * @param {*} desc
     */
    onWrite(pack, data) {

        this.pack = pack;

        const dir = this.getDir();

        const confDir = path.join(dir, '.vuepress');

        mkpath.sync(confDir);

        //TODO write toc on front page
        const config = {
            title: pack.name,

            editLinks: false,
            themeConfig: {
                repo: _.get(pack, 'packageJson.repository.url'),
                sidebar: this.getSideBar()
            }
        };

        fs.writeFileSync(path.join(confDir, 'config.js'), `module.exports = ${JSON.stringify(config, null, 2)}`);

    }

};