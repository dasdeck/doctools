
const fs = require('fs');
const jsdoc = require('jsdoc-api');
const _ = require('lodash');
const glob = require('glob');
const path = require('path');

const {crudeImport} = require('./util');

const base = 'module.exports';


function findMembers(data, name) {

    const props = {};

    data.forEach(el => {
        if(['member', 'function', 'event'].includes(el.kind)&& el.memberof && el.memberof === base + '.' + name) {
            props[el.name] = el;
        }

    })
    return props;
}

function findProps(data, runtime) {
    const res = findMembers(data, 'props')
    if (runtime && runtime['props']) {
        const realProps = runtime['props'];
        const ukDefaults = runtime['defaults'];
        _.forEach(res, prop => {

            const realProp = realProps[prop.name]
            if (realProp) {

                prop.required = prop.required || ~prop.meta.code.value.indexOf('{"required":true}') || realProp.required;

                if (!prop.type) {
                    if(realProp.type && realProp.type instanceof Function) {
                        prop.type = {names: [realProp.type.name]};
                    } else if(realProp instanceof Function) {
                        prop.type = {names: [realProp.name]};
                    } else {
                        debugger;
                    }
                }

                if (!prop.defaultvalue && ukDefaults) {
                    prop.defaultvalue = ukDefaults[prop.name];
                }
            }
        });
    }
    return res;

}

function findData(data) {
    const res = [];
    data.forEach(el => {
        if (!el.undocumented && el.kind === 'member' && el.scope === 'global') {
            res.push(el);
        }
    });

    return res;
};

function findEvents(data) {

    const emit = [];
    data.forEach(el => {
        if (el.kind === 'event') {
            emit.push(el);
        }
    });
    return emit;
};

function getTriggers(data) {

    return data.filter();
}

function findMethods(data) {
    const res = findMembers(data, 'methods');
    const parser = require('./moduleParser');
    _.forEach(res, func => {
        // const fun = parser.analyseFunction(func, name);
        func.signature = func.signature && func.signature.split('.methods.').pop();
        res[func.name] = func;

    });
    return res;
}


module.exports = {

    parseTemplate(desc) {

        const template = desc.template;

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
                const type = templateComment[2];

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
                        currentParent[key].push(current);
                    }
                } else if (parentKind.includes(kind)) {
                    currentParent = current;
                    desc[kind] = desc[kind] || [];
                    desc[kind].push(current);
                }
            }

        } while (templateComment);

    },

    analyzeComponent(file) {

        const desc = this.unpack(file);

        const jsParsed = jsdoc.explainSync({source: desc.script});

        const res = this.map(jsParsed, desc.runtime);

        Object.assign(desc, res);

        parseTemplate(template, desc);

        return desc;

    },

    map({documented: entries, runtime}) {

        const desc = {};

        [
            {props: findProps},
            {data: findData},
            'computed',
            {methods: findMethods},
            'events',
            {emit: findEvents},
            {trigger: data => data.filter(el => el.kind === 'trigger')}
        ].forEach(type => {

            const simple = typeof type === 'string';

            const name = simple ? type : Object.keys(type)[0];

            const members =  simple ? findMembers(entries, name, runtime) : type[name](entries, runtime);
            if (_.size(members)) {
                desc[name] = members;
            }
        });

        entries.forEach(data => {
            if (data.longname === base) {
                desc.description = data.description;
            }
        })

        return desc
    },

    unpack(file) {

        const vueComiler = require('vue-template-compiler');

        const text = fs.readFileSync(file, 'utf8');
        const res = vueComiler.parseComponent(text);

        const template = res.template && res.template.content;
        const script = res.script && res.script.content;

        let runtime;
        if (script) {
            runtime = crudeImport;
        }

        const name = file.split('/').pop().split('.').shift();

        return {
            type: 'Vue',
            name,
            file,
            template,
            script,
            runtime
        };

    }

};