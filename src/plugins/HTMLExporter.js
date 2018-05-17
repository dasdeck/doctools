const Plugin = require('../Plugin');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const pretty = require('pretty');
const mkpath = require('mkpath');


/**
 * attemts to load the described class
 * mark module for runtime analysis by setting a member runtime = true
 */
class HTMLExporter extends Plugin {

    constructor(config = HTMLExporter.defaultConfig) {
      super();
      this.config = config;
      _.defaults(this.config, HTMLExporter.defaultConfig);

    }

    onDispose() {
      this.clearDom();
      this.server && this.server.close();
    }

    onGet(app, data) {
      data.routeMap = this.config.routeMap && this.config.routeMap(app, data) || _.mapValues(data.resources, res => res.resource);
    }

    onLoad(app) {

      if (this.config.serve) {
        const http = require('http');
        const port = this.config.serve.port || 3050;
        this.server = http.createServer((req, res) => {

            this.app.analyze().then(() => {

              const data = app.get();
              const resource = data.resources[data.routeMap[req.url.substr(1)]];

              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Request-Method', '*');
              res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
              res.setHeader('Access-Control-Allow-Headers', '*');

              if (resource) {
                this.initDom();
                this.prepareDocApp();
                res.end(this.renderPage(resource));
                this.clearDom();
              } else {
                res.end('not found');
              }
          });
        });

        this.server.listen(port, res => {
          this.app.log('HTMLExporter listening @ port:  ' + port + ' ')
        });

      }

    }

    prepareDocApp() {

      const app = this.app;
      const {DocPage, DocBase, ExampleRunner} = require('./MarkdownAdapter.min.js');

      const exporter = this;

      const Vue = require('vue/dist/vue');

      _.assign(ExampleRunner.runners, this.app.config.runners, this.config.runners);

      if (this.config.markdown) {
        DocBase.methods.markdown = this.config.markdown;
      }

      if (this.config.highlight) {
        DocBase.methods.highlight = this.config.highlight;
      }

      const DocBaseData = DocBase.data;
      DocBase.data = () => _.omit(DocBaseData.call(this), ['data']);
      DocBase.computed = DocBase.computed || {};
      DocBase.computed.data = function() {
        return app.get();
      }

      this.docApp = new Vue(DocBase);

      this.Page = Vue.extend(DocPage);

      Vue.component('RouterLink', {
        template: '<a :href="`${link}`"><slot/></a>',
        props:['to'],
        computed: {
          link() {
            // debugger
            return exporter.config.createLink(app, app.resources[this.to.substr(1)], app.get());
          }
        }
      });

      Vue.component('Code', {
        template: '<pre><code :class="`language-${language}`"><slot/></code></pre>',
        props:['language']
      });
    }

    initDom() {

      this.domClear = require('jsdom-global')();
      global.UIkit = require('uikit');
      document.body.innerHTML = `<div id="app"></div>`;
      this.appEl = document.getElementById('app');

    }

    clearDom() {
      UIkit.util.fastdom.flush();
      this.domClear && this.domClear();
    }

    renderPage(resource) {

      const vm = new this.Page({propsData: {moduleOverride: resource}, parent: this.docApp});
      vm.$mount(this.appEl);
      const html = pretty(vm.toHtml()).replace(/<!---->/g, '');
      vm.$destroy();

      return this.config.postProcess(this.app, html, resource);

    }

    renderHTML(app, data, output = null) {

      this.initDom();
      this.prepareDocApp();

      const dir = output || this.config.output && this.app.resolvePath(this.config.output);

      mkpath.sync(dir);

      const files = [];

      _.forEach(this.config.resources(app, data), resource => {

        const html = this.renderPage(resource);

        const changed = resource.html !== html;

        //set markdown in serialized AND original data to cache and further process
        if(this.config.cache) {
          app.resources[resource.resource].html = html;
        }

        resource.html = html;

        if (dir && changed) {
          const dest = path.join(dir, this.config.getFileName(app, resource, data));
          mkpath.sync(path.dirname(dest));
          fs.writeFileSync(dest, html);
          files.push(dest);

        }



      });

      this.clearDom();

      return files;

    }

    /**
     * helper function to load the runtime for a component or module
     * @param {*} config
     * @param {*} desc
     */
    onWrite(app, data) {

      if (this.config.output) {

        if (this.config.async) {
          setTimeout(res => this.renderHTML(app, data), 100);
        } else {
          this.renderHTML(app, data);
        }

      }

    }
}

HTMLExporter.defaultConfig = {

  output: 'html',
  cache: false,
  async : false,
  serve: false,
  runners: {},

  createLink(app, desc, data) {
    return desc.resource.replace(/\./g, '-') + '.html';
  },

  getFileName(app, desc, data) {
    return desc.resource + '.html'
  },

  resources (app, data) {
    return app.resources;
  },

  postProcess(app, html, desc) {
    return html;
  },

  markdown: null,

};

module.exports = HTMLExporter;