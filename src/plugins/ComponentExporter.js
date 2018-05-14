const Plugin = require('../Plugin');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const pretty = require('pretty');
const mkpath = require('mkpath');
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

    renderHTML(app, data) {
      // app.log('exporting HTML...')
      const clear = require('jsdom-global')();

      global.UIkit = require('uikit-ssr');

      const {DocPage, DocBase} = require('./MarkdownAdapter.min.js');

      document.body.innerHTML = `<div id="app"></div>`;

      const appEl = document.getElementById('app');

      const Vue = require('vue/dist/vue');

      const Page = Vue.extend(DocPage);

      if (this.config.markdown) {
        DocBase.methods.markdown = this.config.markdown;
      }

      const docBase = new Vue(DocBase);
      docBase.data = data;

      const exporter = this;

      // debugger;
      Vue.component('RouterLink', {
        template: '<a :href="`${link}`"><slot/></a>',
        props:['to'],
        computed: {
          link() {
            // debugger
            return exporter.config.createLink(app, app.resources[this.to.substr(1)], data);
          }
        }
      });

      Vue.component('Code', {
        template: '<pre><code :class="`language-${language}`"><slot/></code></pre>',
        props:['language']
      });

      const dir = this.config.output && this.app.resolvePath(this.config.output);
      try {
        if (dir) {
          fs.mkdirSync(dir)
        }

      } catch (e) {

      }

      _.forEach(this.config.resources(app, data), resource => {

        // if (this.config.cache && resource.html) {
        //   return;
        // }

        const vm = new Page({propsData: {moduleOverride: resource}, parent: docBase});
        vm.$mount(appEl);
        const html = pretty(vm.toHtml()).replace(/<!---->/g, '');

        const changed = resource.html !== html;

        //set markdown in serialized AND original data to cache and further process
        if(this.config.cache) {
          app.resources[resource.resource].html = html;
        }

        resource.html = html;

        vm.$destroy();
        setImmediate(clear);

        if (dir && changed) {
          const dest = path.join(dir, this.config.getFileName(app, resource, data));
          mkpath.sync(path.dirname(dest));
          fs.writeFileSync(dest, this.config.postProcess(app, html, data));
        }

      });

      // pack.log('exporting HTML...done!')
    }

    /**
     * helper function to load the runtime for a component or module
     * @param {*} config
     * @param {*} desc
     */
    onWrite(app, data) {

      if (this.config.async) {
            setTimeout(res => this.renderHTML(app, data), 100);
      } else {
          this.renderHTML(app, data);
      }

    }

}
ComponentExporter.defaultConfig = {

  output: 'html',
  cache: false,
  async : false,

  createLink(app, desc, data) {
    return desc.resource.replace(/\./g, '-') + '.html';
  },

  getFileName(app, desc, data) {
    return desc.resource + '.html'
  },

  resources (app, data) {
    return app.resources;
  },

  postProcess(app, html) {
    return html;
  },

  markdown: null,

};

module.exports = ComponentExporter;