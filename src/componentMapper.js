
const fs = require('fs');
const jsdoc = require('jsdoc-api');
const _ = require('lodash');
const glob = require('glob');
const path = require('path');

const {findRuntime, findPropDefaults} = require('./util');

const base = 'module.exports';

/**
 * @file
 * the componentmapper offers functions to map a regular jsdoc file into a meaningfull json structure
 * it can also enrich the jsdoc structure with valuable runtime informations
 */

function findMembers(data, name) {

    const props = {};

    data.forEach(el => {

        const longAdd = base + '.' + name;
        if(['member', 'function', 'event'].includes(el.kind)&& el.memberof && el.memberof === longAdd) {
            el.simpleName = el.name;
            props[el.name] = el;
        }

    })
    return props;
}


function findProps(data, runtime) {
    const res = findMembers(data, 'props')

    //
    if (runtime) {
        findPropDefaults(res, runtime);
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
                        currentParent[key].push(current);
                    }
                } else if (parentKind.includes(kind)) {
                    currentParent = current;
                    res[kind] = res[kind] || [];
                    res[kind].push(current);
                }
            }

        } while (templateComment);

    },

    analyzeComponent(file) {

        const res = this.unpack(file);

        const jsParsed = jsdoc.explainSync({source: res.script});

        const res = this.map(jsParsed, res.runtime);

        Object.assign(res, res);

        parseTemplate(template, res);

        return res;

    },


    map(desc) {

        const {documented: entries, runtime, function: funcs} = desc;

        const res = {};

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

            const members =  simple ? findMembers(entries, name, runtime) : type[name](entries, runtime);
            if (_.size(members)) {
                res[name] = members;

                //remove functions form the general function list
                _.forEach(members, member => {
                    _.remove(funcs, func => func === member);
                });
            }



        });



        entries.forEach(data => {
            if (data.longname === base) {
                res.description = data.description;
            }
        })

        return res
    },

    unpack(file) {

        const vueComiler = require('vue-template-compiler');

        const text = fs.readFileSync(file, 'utf8');
        const res = vueComiler.parseComponent(text);

        const template = res.template && res.template.content;
        const script = res.script && res.script.content;


        const name = file.split('/').pop().split('.').shift();

        return {
            type: 'VueComponent',
            name,
            file,
            template,
            script,
        };

    }

};