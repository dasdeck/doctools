
const _ = require('lodash');


const Plugin = require('./Plugin');

module.exports = class ComponentPlugin extends Plugin {

    onMap(desc) {
        this.mapComponent(desc);
    }

    mapComponent(desc) {
        const data = desc.module;

        const component = {};
        if (!data || !data.types) debugger;

        const {documented: entries, types: {function: funcs}} = data;
        const runtime = desc.runtime;

        base = 'module.exports';
        data.all.forEach(entry => {
            if ((entry.type && entry.type.names.includes(data.type)) && entry.kind === 'constant') {
                base = entry.longname;
            }
        });

        [
            {props: findProps},
            {data: findData},
            'computed',
            {methods: findMethods},
            'events',
            {emit: findEvents},
            {trigger: data => data.filter(el => el.kind === 'trigger')},
            {components: (data, runtime) => ['test']}
        ].forEach(type => {

            const simple = typeof type === 'string';

            const name = simple ? type : Object.keys(type)[0];

            const members = simple ? findMembers(entries, name, runtime) : type[name](entries, runtime);
            if (_.size(members)) {
                component[name] = members;

                //remove functions form the general function list
                _.forEach(members, member => {
                    _.remove(funcs, func => func === member);
                });
            }

        });

        entries.forEach(el => {
            if (el.longname === base) {
                data.description = el.description;
            }
        });

        desc.component = component;
    }

};