const Plugin = require('../Plugin');
const path = require('path');
const fs = require('fs');
const mkpath = require('mkpath');
const _ = require('lodash');
// const prismjs = require('prismjs');
/**
 * attemts to load the described class
 * mark module for runtime analysis by setting a member runtime = true
 */
class VuePressExporter extends Plugin {

    constructor(config = VuePressExporter.defaultConfig) {
        super();
        this.config = config;

        _.defaults(this.config, VuePressExporter.defaultConfig);

        const examples = this.examples = {};

        const clear = require('jsdom-global')();
        const {ExampleRunner} = require('../../ui/MarkdownAdapter.min.js');

        ExampleRunner.mounted = function() {
            examples[this.data.id] = _.omit(this.data, ['instance']);
        };

        setImmediate(clear);

    }

    onWrite(app, data) {
        if (this.config.async) {
            setTimeout(res => this.write(app, data), 100);
        } else {
            this.write(app, data);
        }
    }

    getResourcFileName(res) {

        const filename = this.getResourceMDName(res);
        const dir = this.getDataDir();
        const file = path.join(dir, filename);
        return file;
    }

    getResourceMDName(res) {

        const filename = this.config.getMDFileName(res);
        return filename;
    }

    writeMarkdown() {

        const resources = this.pack.getResources();
        _.forEach(resources, res => {

            //cleanup links
            const file = this.getResourcFileName(res);
            let markdown = res.markdown;

            _.forEach(this.pack.getResources(), res => {

                const file = this.getResourceMDName(res);
                markdown = markdown.replace(new RegExp(`href="${file}"`, 'g'), `href="${file.replace('.md', '.html')}"`);
            });

            let changed;
            try {
                changed = fs.readFileSync(file, 'utf8') !== markdown;
            } catch (e) {
                changed = true;
            } finally {
                if (changed) {
                    fs.writeFileSync(file, markdown);
                }
            }
        })

        fs.writeFileSync(path.join(this.getDataDir(), 'README.md'), _.map(resources, res => {
            return `[${res.name}](${this.getResourceMDName(res)})`;
        }).join('\n\n'));

    }

    getResourceSidebarEntry(res) {

        const filename = this.getResourceMDName(res);
        return [filename, res.name];
    }
    /**
     *
     * @param {Package} pack
     */
    getSideBar() {

        const menu = this.pack.createMenu();
        if (menu) {

            const resources = this.pack.getResources();

            return menu.map(entry => {
                return {
                    title: entry.label,
                    children: entry.items.map(res => {
                        return this.getResourceSidebarEntry(resources[res]);
                    })
                };
            });

        } else { // get package hierarchy menu

            const packages = _.filter(this.pack.getResources(), res => res.type === 'package');

            return _.map(packages, pack => {

                const resources = _.filter(pack.getPackageModules(), res => res.markdown);
                return {
                    title: pack.name,
                    children: _.map(resources, res => this.getResourceSidebarEntry(res))
                };

            });

        }

    }


    getDataDir() {
        const dir = this.app.resolvePath(this.config.outputDir);
        const subDir = this.config.subdir === true ? this.pack.name : this.config.subdir;
        return subDir ? path.join(dir, subDir) : dir;
    }



    /**
     * helper function to load the runtime for a component or module
     * @param {*} config
     * @param {*} desc
     */
    write(pack, data) {

        pack.log('exporting vuepress...');

        this.pack = pack;

        const dir = this.getDataDir();
        mkpath.sync(dir);

        const confDir = path.join(dir, '.vuepress');

        fs.writeFileSync(path.join(this.getDataDir(), 'examples.json'), JSON.stringify(this.examples, null, 2));

        //TODO write toc on front page
        if (this.config.subdir) {

            const sidebar = this.getSideBar();
            fs.writeFileSync(path.join(this.getDataDir(), 'sidebar.json'), JSON.stringify(sidebar, null, 2));

        } else {

            mkpath.sync(confDir);

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

        this.writeMarkdown();

        pack.log('exporting vuepress...done');

    }

}

VuePressExporter.defaultConfig = {
    /**
     * if you only want
     */
    subdir: true,

    async: true,

    outputDir: 'vuepress',

    serve: 'runtime',

    getMDFileName(desc) {
        return desc.resource.replace(/\./g, '-') + '.md';
    }

};

module.exports = VuePressExporter;