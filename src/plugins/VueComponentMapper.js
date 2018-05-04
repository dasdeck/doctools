const fs = require('fs');
const _ = require('lodash');
const ComponentMapper = require('./ComponentMapper');
const util = require('../util');

module.exports = class VueComponentMapper extends ComponentMapper {


    /**
     *
     * @param {*} desc
     */
    matchesType(desc) {
        return desc.type === 'VueComponent' || _.endsWith(desc.path, '.vue');
    }


    onMap(desc) {

        this.mapComponent(desc);
        this.parseTemplate(desc);

        if(desc.component.trigger) {

            _.forEach(desc.component.trigger, trigger => {

                trigger.resource = desc.resource;
                trigger.template = 'function';
                trigger.simpleName = trigger.name;
                util.mapParams(trigger);

                desc.package.globals.trigger = desc.package.globals.trigger || [];
                desc.package.globals.trigger.push(trigger);

            });

        }

        return Promise.resolve();

    }

    parseTemplate(desc) {

        const {template} = desc.template;
        const component = desc.component;

        const named = ['param', 'trigger', 'slot'];
        const subKind = ['param'];
        const parentKind = ['trigger', 'slot'];
        const subKeyMapping = {param: 'params'};

        let currentParent = null;

        let templateComment = null;
        const regex = /<!--\s*@(\w+)\s*(?:{([^}]*)})?\s*(\w*)?(?: - )?\s*(.*?)\s*-->/gs;
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
                    component[kind] = component[kind] || {};
                    component[kind][current.name]= current;
                }
            }

        } while (templateComment);

    }
}