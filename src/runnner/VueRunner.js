
const babel = require('@babel/standalone');

//fake weird bug in vuepress
if (typeof process === 'undefined') {
    process = {
        platform: 'browser'
    }
}

const umdPlugin = require('babel-plugin-transform-es2015-modules-umd');
const Vue = require('vue').default || require('vue'); //hack for vuepress 
const vueTemplateCompiler = require('vue-template-compiler');

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
        return scope.result.default;`

        const fun = new Function('scope', scopeCode);

        const componentDefinition = fun({});

         if (componentDefinition.components) {
            throw 'vue examples can not have local components';
        }

        return componentDefinition;
    }

    preview(code, el, resource) {

        let componentDefinition;
        
        if (this.getLanguage(code) === 'html') {
            const res = vueTemplateCompiler.parseComponent(code);
            componentDefinition = this.getComponentDefinition(res.script.content);
            componentDefinition.template = res.template.content;
        } else {
            componentDefinition = this.getComponentDefinition(code);
        }
        
        if (componentDefinition.template) {
            
            const renderFuncs = vueTemplateCompiler.compileToFunctions(componentDefinition.template, componentDefinition);
            componentDefinition.render = renderFuncs.render;
        }
        
        const comp = Vue.extend(componentDefinition);
        const instance = new comp();
        
        instance.$mount(el);
            
        return '...loading';
     
    }
}

VueRunner.runtime = {};

VueRunner.RTAConfig = {
    libraryTarget: 'var',
    output: 'runtime'
}

module.exports = VueRunner;