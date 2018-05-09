<template>
  <div v-html="html">
  </div>
</template>

<script>

import marked from 'marked';
import Prism from 'prismjs';
import Vue from 'vue';

import ExampleRunner from '../ExampleRunner.vue';
import ModuleComp from './ModuleComp.js';
import _ from 'lodash';


const Markdown = {

    components: {
        ExampleRunner
    },

    baseRenderer: new marked.Renderer(),

    extendRenderer: {},

    props:{
        text: String
    },

    extends: ModuleComp,

    data() {
        const renderer = new marked.Renderer();
        renderer.code = (code, lang, escaped) => {

            const [run, runnerName] = lang.split(':').map(el => el.trim());
            if (run === 'run' && runnerName && ExampleRunner.runners[runnerName]) {

                const runner = ExampleRunner.runners[runnerName];

                if (runner && runner.plain) {

                    return runner.plain(code, this);

                } else {

                    const id = 'runner-' + this.module.resource.replace(/[^a-zA-Z0-1]*/g, '-') + '-' + (this.runners.length + 1);
                    this.runners.push({
                        id,
                        lang,
                        code,
                        escaped,
                        name: this.module.name,
                        resource: this.module.resource
                    });

                    return `<div id="${id}"></div>`;

                  }
            } else {

                return this.renderCode(code, lang, escaped);
            }
        };

        Object.assign(renderer,_.omit(Markdown.extendRenderer, ['code']));

        return {
            renderer,
            runners: []
        };
    },

    mounted() {
        this.updateExampleRunners();
    },

    watch: {

        text() {
            this.clearRunners();
        },
        html() {
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

        updateExampleRunners(retry = true) {

            this.runners.some(data => {

                if (!data.instance) {

                    const id = `#${data.id}`;
                    const el = UIkit.util.$(id, this.$el);

                    const dynamicRuntime = this.$doc.runtime && this.$doc.runtime[this.module.resource];

                    if (el) {

                        const ExampleRunnnerComp = Vue.extend(ExampleRunner);
                        data.instance = new ExampleRunnnerComp({propsData: {data, dynamicRuntime}, el});

                    } else if (retry) {

                        Vue.nextTick(res => {
                            this.updateExampleRunners(false);
                        });

                    } else {

                        debugger;

                    }

                }
            });
        },

        renderCode(code, lang, escaped) {
                if (Markdown.extendRenderer.code) {
                    return Markdown.extendRenderer.code(code, lang, escaped);
                } else if (Prism.languages[lang]) {
                    return `<pre><code class="language-${lang}">${Prism.highlight(code, Prism.languages[lang], lang)}</code></pre>`;
                } else {
                    return Markdown.baseRenderer.code(code, lang, escaped);;
                }
        },

        markdown(code) {
            return marked(code, {renderer: this.renderer})
        }
    },

    computed: {
        html() {
            return this.text && this.markdown(this.text);
        }
    }
}

export default Markdown;
</script>

<style>

</style>
