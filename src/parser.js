const fs = require('fs');
const util = require('./util');
const {getTestCodes} = require('./testParser');

const uikitShim = require('./uikitShims');

uikitShim.install();
const UIkit = require('uikit');
uikitShim.clear();

module.exports = {

    preProcess: {
        vue(desc, file) {
            const componentParser = require('./componentParser');
            Object.assign(desc, componentParser.unpack(file));
        },
        js(desc, file) {
            desc.script = fs.readFileSync(file, 'utf8');
        }
    },
    mapper: {
        'Vue'(desc) {
            const componentParser = require('./componentParser');
            const res = componentParser.map(desc);
            Object.assign(desc, res);
            if (desc.template) {
                componentParser.parseTemplate(desc);
            }
        },
        'UIkitComponent'(desc) {

            desc.runtime = desc.runtime || UIkit.components[desc.name] && UIkit.components[desc.name].options || UIkit.mixin[desc.name];
            const componentParser = require('./componentParser');
            const res = componentParser.map(desc);
            Object.assign(desc, res);
        }
    },
    parse(file) {

        const name = file.split('/').pop().split('.').shift();
        const desc = {file, name, type: 'module'};

        if (fs.lstatSync(file).isDirectory()) {

            desc.type = 'package';
            const packageParser = require('./packageParser');
            const res = packageParser.analyzePackage(file);
            Object.assign(desc, res);
            return res;
        }

        const extension = file.split('.').pop();

        if (!this.preProcess[extension]) {
            throw 'unknown extension: ' + extension;
        } else {
            this.preProcess[extension](desc, file);
        }

        const moduleParser = require('./moduleParser');
        const jsDoc = moduleParser.analyzeModule(desc.script);

        Object.assign(desc, jsDoc);
        //coverage
        // const cover = require('./coverage/coverage.sum.json');
        // const covers = {};
        // _.forEach(cover, (entry, name) => {
        //     covers[name.split('/').pop().replace(/.js/g,'')] = entry;
        // });
        // const coverage = covers[name] && covers[name].lines.pct || 0;


        //test codes (per function / member)
        // el.tests = getTestCodes(name, el.longname);

        if (this.mapper[desc.type]) {
            this.mapper[desc.type](desc);
        }

        return desc;
    }
}