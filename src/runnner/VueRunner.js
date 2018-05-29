
/* global process */
import * as babel from '@babel/standalone';

import umdPlugin from 'babel-plugin-transform-es2015-modules-umd';
import * as vueTemplateCompiler from 'vue-template-compiler';

import Vue from 'vue'; //hack for vuepress

//fake weird bug in vuepress
if (typeof process === 'undefined') {
    process = { // eslint-disable-line
        platform: 'browser'
    };
}

class VueRunner {

    getLanguage(code) {
        return code.trim().substr(0, 1) === '<' ? 'html' : 'js';
    }

    getComponentDefinition(rawScript) {

        const transformed = babel.transform(rawScript, {
            presets: ['es2015'],
            plugins: [umdPlugin]
        });

        const scopeCode = `${transformed.code.replace('void 0', 'scope')
        .replace('global.undefined', 'global.result')}
        return scope.result.default;`;

        const fun = new Function('scope', scopeCode);

        const componentDefinition = fun({});

        if (componentDefinition.components) {
            throw 'vue examples can not have local components';
        }

        return componentDefinition;
    }

    preview(runner) {

        let componentDefinition;
        const code = runner.code;

        if (this.getLanguage(code) === 'html') {
            // debugger;
            const res = vueTemplateCompiler.parseComponent(code);
            componentDefinition = this.getComponentDefinition(res.script.content);
            componentDefinition.template = res.template.content;
        } else {
            componentDefinition = this.getComponentDefinition(code);
        }

        if (runner.runtime) {
            componentDefinition.components = {
                [runner.moduleName]: runner.runtime
            };
        }

        if (componentDefinition.template) {

            const renderFuncs = vueTemplateCompiler.compileToFunctions(componentDefinition.template, componentDefinition);
            componentDefinition.render = renderFuncs.render;
        }

        const comp = Vue.extend(componentDefinition);
        const instance = new comp();

        instance.$mount(runner.$refs.preview);

        return '...loading';

    }
}

export default VueRunner;