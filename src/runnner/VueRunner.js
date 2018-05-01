
const babel = require('@babel/standalone');
const umdPlugin =require('babel-plugin-transform-es2015-modules-umd');
const Vue = require('vue');

module.exports = class VueRunner {

    constructor() {

        const vue = document.createElement('script');
        vue.src = 'https://cdn.jsdelivr.net/npm/vue-template-compiler@2.5.16/browser.min.js'
        document.head.append(vue);
        // vue.src = 'https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.16/vue.min.js';
        const babel = document.createElement('script');
        babel.src = 'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js'
        document.head.append(babel);
        // vue.src = 'https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.16/vue.min.js';

    }

    getLanguage(code) {
        return code.trim().substr(0, 1) === '<' ? 'html' : 'js';
    }

    preview(code, el, resource) {
        if (this.getLanguage(code) === 'html') {
            const res = VueTemplateCompiler.parseComponent(code);
            const script = babel.transform(res.script.content, { 
                presets: ['es2015'],
                plugins: [umdPlugin]
            });

            const scopeCode = `${script.code.replace('void 0', 'scope')
            .replace('global.undefined', 'global.result')}
            return scope.result.default;`

            const fun = new Function('scope', scopeCode);

            const componentDefinition = fun({});

            const renderFuncs = VueTemplateCompiler.compileToFunctions(res.template.content, componentDefinition);
            
            if (componentDefinition.components) {
                throw 'examples can not have custom components, only the component described is valid';
            }

            componentDefinition.components = {

            }

            componentDefinition.render = renderFuncs.render;


            const comp = Vue.extend(componentDefinition);
            const instance = new comp();

            instance.$mount(el);
            
            return '';
     
        }
    }
}