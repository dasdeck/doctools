const vueComiler = require('vue-template-compiler');
const _ = require('lodash');
const fs = require('fs');

module.exports = class VueLoader {

    match(file) {
        return _.endsWith(file, '.vue');
    }

    load(file) {

        try {
            return this.unpack(file);
        } catch (e) {
            console.warn('error loading vue component', file);
        }
        return {script: ""};
    }

    unpack(file) {

        const text = fs.readFileSync(file, 'utf8');
        const res = vueComiler.parseComponent(text);

        const template = res.template && res.template.content.trim() !== '' && {template: res.template.content.trim()};
        const script = res.script && res.script.content.trim();

        return {
            type: 'VueComponent',
            template,
            script,
        };


    }
}