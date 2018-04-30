const Plugin = require('../Plugin');
const Package = require('../Package');
const path = require('path');
const fs = require('fs');

const Turndown = require('turndown');
const {gfm} = require('turndown-plugin-gfm');

const markdownAdapterSource = '../../ui/MarkdownAdapter.min.js';


const turndown = new Turndown({
    codeBlockStyle: 'fenced'
});
turndown.use(gfm);

/**
 * attemts to load the described class
 * mark module for runtime analysis by setting a member runtime = true
 */
module.exports = class MarkdownExporter extends Plugin {

    getShallowContet(data, resource) {

      const {Content} = require(markdownAdapterSource);

      const $doc = {
          selectedModule:  resource,
          ...data,
          data,
          settings: {
            private: true,
            filter: ''
          }
      }



      const comp = {
          ...Content, 
          provide: {
              $doc
          },
          computed: {
              ...Content.computed,
              '$doc'() {
                  return $doc;
              }
          },
          methods: {
            ...Content.methods,
            toMarkdown() {

              const toMD = this.$el.cloneNode(true);

              const UIkit = require('uikit');
              UIkit.util.remove(UIkit.util.$$('.nomd', toMD));
              return turndown.turndown(toMD.outerHTML);
      
            }
          }
      };

      delete comp.inject;
      delete comp.watch;

      return comp;
  };

    /**
     * helper function to load the runtime for a component or module
     * @param {*} config
     * @param {*} desc
     */
    onWrite(pack, data) {

      const clear = require('jsdom-global')();
      
      const Vue = require('vue/dist/vue');

      Vue.component('RouterLink', {
        template: '<a :href="`${to}.md`"><slot/></a>',
        props:['to']
      });
      Vue.component('Code', {
        template: '<pre ><code :class="`language-${language}`"><slot/></code></pre>',
        props:['language']
      });

      const dir = path.join(pack.config.base, 'markdown');
      try {
        fs.mkdirSync(dir)

      } catch (e) {
      }

      _.forEach(data.resources ,resource => {

        const CompDesc = this.getShallowContet(data, resource);
        const Comp = Vue.extend(CompDesc);
        const vm = new Comp({propsData: {resource: resource.resource}});
        vm.$mount();
        const markdown = vm.toMarkdown();
        resource.markdown = markdown;
        vm.$destroy();

        fs.writeFileSync(path.join(dir, resource.resource + '.md'), markdown);
   
      });

      const vuePressDir = path.join(dir, '.vuepress');
      
      try {
        fs.mkdirSync(vuePressDir);
        
      } catch (e) {}

      fs.writeFileSync(path.join(vuePressDir, 'config.js'), `module.exports = ${JSON.stringify({
        title: pack.name,
    
        themeConfig: {
            sidebar: _.map(data.resources, res => [res.resource + '.md', res.name])
            
        }
      }, null, 2)}`);

      setImmediate(clear);
    }

}