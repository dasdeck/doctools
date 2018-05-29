const fs = require('fs');
const _ = require('lodash');
const ComponentMapper = require('./ComponentMapper');
const util = require('../util');

/**
 * Creates a VueComponentMapper
 * @class
 */
module.exports = class VueComponentMapper extends ComponentMapper {


    /**
     *
     * maps global events (triggers) and template commends
     * @inheritDoc
     */
    onMapModule(desc) {

        if(desc.type !== 'VueComponent') {
            return;
        }
        super.onMapModule(desc);

        if (desc.template) {
            this.parseTemplate(desc);
        }

        if(desc.component.trigger) {

            _.forEach(desc.component.trigger, trigger => {

                trigger.resource = desc.resource;
                trigger.template = 'function';
                trigger.simpleName = trigger.name;
                const {params, tables} = util.mapParams(trigger.params);

                trigger.params = params;
                trigger.tables = tables;

            });

        }

        return Promise.resolve();

    }

    /**
     * parses the vue template for doc comments
     *
     * @param {Module} desc
     */
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