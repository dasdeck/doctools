const Plugin = require('../Plugin');
const Package = require('../Package');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const pretty = require('pretty');
const {DocPage, DocBase} = require('./MarkdownAdapter.min.js');

// const markdownAdapterSource = './MarkdownAdapter.min.js';


/**
 * attemts to load the described class
 * mark module for runtime analysis by setting a member runtime = true
 */
class ComponentExporter extends Plugin {

    constructor(config = ComponentExporter.defaultConfig) {
      super();
      this.config = config;
      _.defaults(this.config, ComponentExporter.defaultConfig);
    }

    // getShallowContet(data, resource) {


    //   const $doc = {
    //       selectedModule:  resource,
    //       ...data,
    //       data,
    //       settings: {
    //         private: true,
    //         filter: ''
    //       }
    //   }

    //   const comp = {
    //       ...DocPage,
    //       provide: {
    //           $doc
    //       },
    //       computed: {
    //           ...DocPage.computed,
    //           '$doc'() {
    //               return $doc;
    //           }
    //       }
    //   };

    //   delete comp.inject;

    //   return comp;
    // };

    renderHTML(pack, data) {
      pack.log('exporting HTML...')
      const clear = require('jsdom-global')();

      document.body.innerHTML = `<div id="app"></div>`;


      const appEl = document.getElementById('app');


      const Vue = require('vue/dist/vue');

      const Page = Vue.extend(DocPage);

      const docBase = new Vue(DocBase);
      docBase.data = data;


      Vue.component('RouterLink', {
        template: '<a :href="`${toClean}.html`"><slot/></a>',
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

      const dir = this.config.output && pack.resolvePath(this.config.output);
      try {
        if (dir) {
          fs.mkdirSync(dir)
        }

      } catch (e) {

      }

      // const res = pack.getResources();
      _.forEach(data.resources, resource => {

        if (this.config.cache && resource.html) {
          return;
        }

        // const CompDesc = this.getShallowContet(data, resource);
        const vm = new Page({propsData: {moduleOverride: resource}, parent: docBase});
        vm.$mount(appEl);
        const html = pretty(vm.toHtml());

        const changed = resource.html !== html;

        //set markdown in serialized AND original data to cache and further process
        resource.html = html;
        data.resources[resource.resource].html = html;

        vm.$destroy();
        setImmediate(clear);

        if (dir && changed) {
          fs.writeFileSync(path.join(dir, resource.resource + '.html'), html);
        }

      });

      pack.log('exporting HTML...done!')
    }
    /**
     * helper function to load the runtime for a component or module
     * @param {*} config
     * @param {*} desc
     */
    onWrite(pack, data) {

      if (this.config.async) {
            setTimeout(res => this.renderHTML(pack, data), 100);
      } else {
          this.renderHTML(pack, data);
      }

    }

}
ComponentExporter.defaultConfig = {
  output: 'html',
  cache: false,
  async : false

};

module.exports = ComponentExporter;