const Plugin = require('./Plugin');
const Package = require('../Package');
const path = require('path');
const fs = require('fs');
const markdownAdapterSource = '../../ui/MarkdownAdapter.min.js';


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
      const {MarkdownMixin} = require(markdownAdapterSource);

      Vue.mixin(MarkdownMixin);
      Vue.component('RouterLink', {
        template: '<a :href="to"><slot/></a>',
        props:['to']
      });
      Vue.component('Code', {
        template: '<pre><code><slot/></code></pre>',
        props:['language']
      });

      _.forEach(data.resources ,resource => {

        const CompDesc = this.getShallowContet(data, resource);
        const Comp = Vue.extend(CompDesc);
        const vm = new Comp({propsData: {resource: resource.resource}});
        vm.$mount();
        const markdown = vm.markdown;
        vm.$destroy();

        const dir = path.join(pack.config.base, 'markdown');
        try {
          fs.mkdirSync(dir)
        } catch (e) {
        }
        fs.writeFileSync(path.join(dir, resource.resource + '.md'), markdown);
   
      });

      setImmediate(clear);
    }

}