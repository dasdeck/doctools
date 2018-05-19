const vueComiler = require('vue-template-compiler');
const _ = require('lodash');
const fs = require('fs');
const Loader = require('../Loader');

module.exports = class VueLoader extends Loader {


    match(file) {
        return _.endsWith(file, '.vue');
    }

    load(source, desc) {

        try {
            return this.unpack(source, desc);
        } catch (e) {
            console.warn('error loading vue component', file);
        }
        return {script: ''};
    }

    unpack(source, desc) {

        const res = vueComiler.parseComponent(source);

        const template = res.template && res.template.content.trim() !== '' && {template: res.template.content.trim()};
        const script = res.script && res.script.content.trim();

        _.assign(desc, {
            type: 'VueComponent',
            template,
            script,
            runtime: true
        });

        res.customBlocks.forEach(el => {
            if (el.type === 'docs' && !el.attrs || el.attrs.name === 'readme') {
                desc.readme = el.content;
            }
        });



    }
};