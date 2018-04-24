const fs = require('fs');
const vueComiler = require('vue-template-compiler');
const _ = require('lodash');
const ComponentPlugin = require('./ComponentPlugin');

module.exports = class VueComponentPlugin extends ComponentPlugin {


    /**
     *
     * @param {*} desc
     */
    matchesType(desc) {
        return _.endsWith(desc.path, '.vue');
    }

    /**
     *
     * @param {*} desc
     */
    onLoad(desc) {

        try {
            Object.assign(desc, this.unpack(desc.path));
        } catch (e) {
            console.warn('not a vue component', desc.path);
        }

    }

    onMap(desc) {

        this.map(desc);
        this.parseTemplate(desc);

    }

    unpack(file) {

        const text = fs.readFileSync(file, 'utf8');
        const res = vueComiler.parseComponent(text);

        const template = res.template && res.template.content;
        const script = res.script && res.script.content;


        return {
            type: 'VueComponent',
            template,
            script,
        };

    }

    parseTemplate(res) {

        const template = res.template;

        const named = ['param', 'trigger', 'slot'];
        const subKind = ['param'];
        const parentKind = ['trigger', 'slot'];
        const subKeyMapping = {param: 'params'};

        let currentParent = null;

        let templateComment = null;
        const regex =  /<!--\s*@(\w+)\s*(?:{([^}]*)})?\s*(\w*)?(?: - )?\s*(.*?)\s*-->/gs;
        do {
            templateComment = regex.exec(template);
            if (templateComment) {
                const comment = templateComment[0];
                const kind = templateComment[1];
                const type = {names: [templateComment[2]]};

                const useName = named.includes(kind);

                const name = useName ? templateComment[3].replace(' - ', '') : null;
                const description = (!useName ? templateComment[3] + ' ' : '') + templateComment[4];

                const current = {comment, kind, type, name, description};

                if (subKind.includes(kind)) {
                    if (!currentParent) {
                        throw kind + ' can only be after another parent kind';
                    } else {

                        const key = subKeyMapping[kind] || kind;
                        currentParent[key] = currentParent[key] || [];
                        currentParent[key][current.name]= current;
                    }
                } else if (parentKind.includes(kind)) {
                    currentParent = current;
                    res[kind] = res[kind] || {};
                    res[kind][current.name]= current;
                }
            }

        } while (templateComment);

    }
}