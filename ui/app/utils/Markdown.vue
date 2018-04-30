<template>
  <div v-html="html">
  </div>
</template>

<script>

import marked from 'marked';
import Prism from 'prismjs';
import Vue from 'vue';

import ExampleRunner from '../ExampleRunner.vue';

const ExampleRunnnerComp = Vue.extend(ExampleRunner);

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
                return defaultRenderer.code(code, lang, escaped);
            }
        };
        return {
            renderer,
            runners: []
        };
    },

    created() {

    },

    watch: {

        runners: {
            handler(runners) {

                runners.forEach(runner => {
                    if (!runner.instance) {
                        runner.instance = new ExampleRunnnerComp({propsData: {data: runner}, el:`#${runner.id}`});
                    }
                });

            },
            immediate: true
        }

    },

    computed: {
        html() {
            return this.text && marked(this.text, {
                renderer: this.renderer,
                highlight: function (code, lang) {
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
