const Plugin = require('../Plugin');
const Package = require('../Package');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const Turndown = require('turndown');

const {gfm} = require('turndown-plugin-gfm');

const markdownAdapterSource = '../../ui/MarkdownAdapter.min.js';


const turndown = new Turndown({
    codeBlockStyle: 'fenced',
    fence: '~~~',
    headingStyle: 'atx'
});
// turndown.use(gfm);
turndown.keep(['table']);

/**
 * attemts to load the described class
 * mark module for runtime analysis by setting a member runtime = true
 */
class MarkdownExporter extends Plugin {

    constructor(config = MarkdownExporter.defaultConfig) {
      super();
      this.config = config;
    }

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

    convertPath(path) {



    }

    /**
     * helper function to load the runtime for a component or module
     * @param {*} config
     * @param {*} desc
     */
    onWrite(pack, data) {

      const clear = require('jsdom-global')();

      document.body.innerHTML = `<div id="app"></div>`;

      const appEl = document.getElementById('app');

      const Vue = require('vue/dist/vue');

      Vue.component('RouterLink', {
        template: '<a :href="`${toClean}.md`"><slot/></a>',
        props:['to'],
        computed: {
          toClean() {
            return this.to.replace(/\./g, '-');
          }
        }
      });

      Vue.component('Code', {
        template: '<pre><code :class="`language-${language}`"><slot/></code></pre>',
        props:['language']
      });

      const dir = this.config.outputDir ? path.join(pack.config.base, this.config.outputDir) : null;
      try {
        if (dir) {
          fs.mkdirSync(dir)
        }

      } catch (e) {
      }

      _.forEach(pack.getResources(), resource => {

        const CompDesc = this.getShallowContet(data, resource);
        const Comp = Vue.extend(CompDesc);
        const vm = new Comp({propsData: {resource: resource.resource}});
        vm.$mount(appEl);
        const markdown = vm.toMarkdown();

        const changed = resource.markdown !== markdown;

        //set markdown in serialized AND original data
        resource.markdown = markdown;
        data.resources[resource.resource].markdown = markdown;

        vm.$destroy();
        setImmediate(clear);

        if (dir && changed) {
          fs.writeFileSync(path.join(dir, resource.resource + '.md'), markdown);
        }

      });

    }

}
MarkdownExporter.defaultConfig = {
  outputDir: 'markdown'
};

module.exports = MarkdownExporter;