
const _ = require('lodash');
const util = require('../util');

let base; //= 'module.exports';

/**
 * @file
 * the componentmapper offers functions to map a regular jsdoc file into a meaningfull json structure
 * it can also enrich the jsdoc structure with valuable runtime informations
 */

function findMembers(data, name) {

    const props = {};

    data.forEach(el => {

        const longAdd = base + '.' + name;
        if (['member', 'function', 'event'].includes(el.kind) && el.memberof && el.memberof === longAdd) {
            el.simpleName = el.name;
            props[el.name] = el;
        }

    });
    return props;
}

function findProps(data, runtime) {
    const res = findMembers(data, 'props');

    if (runtime) {
        util.findPropDefaults(res, runtime);
    }

    return res;

}

function findData(data) {
    const res = {};
    data.forEach(el => {
        if (!el.undocumented && el.kind === 'member' && el.scope === 'global') {
            res[el.name] = el;
        }
    });

    return res;
}

function findEvents(data) {

    const emit = {};
    data.forEach(el => {
        if (el.kind === 'event') {
            emit[el.name] = el;
        }
    });
    return emit;
}

function findMethods(data) {
    const res = findMembers(data, 'methods');
    // const parser = require('./Module');
    _.forEach(res, func => {
        func.signature = func.signature && func.signature.split('.methods.').pop();
        res[func.name] = func;

    });
    return res;
}

const Plugin = require('../Plugin');

module.exports = class ComponentMapper extends Plugin {

    onSerialize(desc, data) {

        data.component = desc.component;
        // delete data.runtime;
    }

    onMap(app) {

        _.forEach(app.resources, res => {
            if (res.module) {
                this.onMapModule(res);
            }
        });

    }

    onMapModule(desc) {
        const data = desc.module;

        const component = {};

        const entries = data.all.filter(el => !el.undocumented);
        const runtime = desc.runtime;

        base = 'module.exports';

        //find base
        data.all.forEach(entry => {
            if ((entry.type && entry.type.names.includes(data.type)) && entry.kind === 'constant') {
                base = entry.longname;
            }
        });

        const mod = desc.module.global[base];

        [
            {props: findProps},
            {data: findData},
            'computed',
            {methods: findMethods},
            'events',
            {emit: findEvents},
            {trigger: data => data.filter(el => el.kind === 'trigger')},

        ].forEach(type => {

            const simple = typeof type === 'string';

            const name = simple ? type : Object.keys(type)[0];

            const members = simple ? findMembers(entries, name, runtime) : type[name](entries, runtime);

            // const visibleMemeber = desc.module.exclude ? _.filter(members, member => {
            //     if (desc.module.exclude) {
            //         const hidden = _.get(desc.module.exclude, `${name}.${member.name}`);
            //         return !hidden;
            //     } else {
            //         return true;
            //     }
            // }) : members;

            if (_.size(members)) {
                component[name] = members;
            }

        });

        desc.component = component;

        if (mod) {
            desc.component.description = mod.description;
            desc.component.tutorials = mod.tutorials;
        }

    }

};