<template>
  <div v-html="html">
  </div>
</template>

<script>

import marked from 'marked';
import Prism from 'prismjs';
import Vue from 'vue';
import UIkit from 'uikit';

import ExampleRunner from '../ExampleRunner.vue';


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

const defaultRenderer = new marked.Renderer();

export default {
    props:{
        text: String
    },

    data() {
        const renderer = new marked.Renderer();
        renderer.code = (code, lang, escaped) => {
            if (lang && lang.indexOf('run:') === 0 || lang === 'run') {
                const id = 'runner-' + guid();
                this.runners.push({
                    id,
                    lang,
                    code,
                    escaped
                });
                return `<div id="${id}"></div>`;
            } else {
                // debugger;    
                if (Prism.languages[lang]) {
                        return `<pre><code class="language-${lang}">${Prism.highlight(code, Prism.languages[lang], lang)}</code></pre>`;
                    } else {
                        return defaultRenderer.code(code, lang, escaped);;
                    }
                // return 
            }
        };
        return {
            renderer,
            runners: []
        };
    },

    mounted() {
        this.updateExampleRunners();
    },

    watch: {
        html() {

            this.clearRunners();
            this.updateExampleRunners();
        }

    },

    methods: {

        clearRunners() {
            this.runners.forEach(runner => {
                if (runner.instance) {
                    runner.instance.$destroy();
                }
            });

            this.runners = this.runners.filter(runner => !runner.instance);
        },

        updateExampleRunners() {
            // if(this.runners.length) {

            //     debugger;
            // }
            this.runners.forEach(runner => {
                if (!runner.instance) {
                    const el = UIkit.util.$(`#${runner.id}`, this.$el);
                    const ExampleRunnnerComp = Vue.extend(ExampleRunner);
                    runner.instance = new ExampleRunnnerComp({propsData: {data: runner}, el});
                }
            });
        }
    },

    computed: {
        html() {
            this.clearRunners();
            return this.text && marked(this.text, {
                renderer: this.renderer,
                highlight: function (code, lang) {
                    debugger;
                    if (Prism.languages[lang]) {
                        return Prism.highlight(code, Prism.languages[lang], lang);
                    } else {
                        return code;
                    }
                }
            });
        }
    }
}
</script>

<style>

</style>
