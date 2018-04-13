
const fs = require('fs');
const vueComiler = require('vue-template-compiler');
const jsdoc = require('jsdoc-api');
const _ = require('lodash');
const glob = require('glob');
const path = require('path');

// const renderComponent = _.template(fs.readFileSync('component.md', 'utf8'));
// const renderPackage = _.template(fs.readFileSync('./package.md', 'utf8'));

module.exports = {
    analyzeComponent(file) {

        function findMembers(data, name) {

            const props = {};

            data.forEach(el => {
                if(['member', 'function', 'event'].includes(el.kind)&& el.memberof && el.memberof.split('.').pop() === name) {
                    props[el.name] = el;
                }
            })
            return props;
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

        function parseTemplate(template, desc = {}) {

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

            return desc;
        }

        function parseJS(source) {

            const desc = {};
            const jsParsed = jsdoc.explainSync({source});

            ['props', {data: findData}, 'computed', 'methods', 'events', {emit: findEvents}, {trigger: data => data.filter(el => el.kind === 'trigger')}].forEach(type => {

                const simple = typeof type === 'string';

                const name = simple ? type : Object.keys(type)[0];

                const members =  simple ? findMembers(jsParsed, name) : type[name](jsParsed);
                if (_.size(members)) {
                    desc[name] = members;
                }
            });

            return desc
        }

        const text = fs.readFileSync(file, 'utf8');
        const res = vueComiler.parseComponent(text);

        const template = res.template && res.template.content;
        const script = res.script && res.script.content;

        const desc = {
            name: file.split('/').pop().split('.').shift(),
            file,
            template,
            script,
            ...script && parseJS(script)
        };

        parseTemplate(template, desc);

        return desc;

    }

};