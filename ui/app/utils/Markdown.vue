<template>
    <div>
        <div v-html="html">
    </div>
</div>
</template>

<script>

import markdown from 'markdown-it';
import {omit} from 'lodash-es';
import Vue from 'vue';

import ExampleRunner from '../ExampleRunner.vue';
import ModuleComp from './ModuleComp.js';


const Markdown = {

    components: {
        ExampleRunner
    },

    extendRenderer: {},

    props:{
        data: Object,
        text: {
            type: String,
            default() {
                return this.data.readme;
            }
        },

    },

    extends: ModuleComp,

    data() {
        const renderer = new markdown({
            highlight:(code, lang) => {
                return this.renderCode(code, lang);
            }
        });

        const fence = renderer.renderer.rules['fence'];
        const component = this;
        renderer.renderer.rules['fence'] = function(tokens, idx) {
            const token = tokens[idx];
            if(token.info.includes(':')) {
                return component.addRunner(token.content, token.info.split(':').map(e => e.trim()));
            } else {
                return fence.apply(this, arguments);
            }

        }


        Object.assign(renderer, omit(Markdown.extendRenderer, ['code']));

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
        addRunner(code, [lang, runnerName]) {

            if (ExampleRunner.runners[runnerName]) {

                const runner = ExampleRunner.runners[runnerName];

                if (runner && runner.plain) {

                    return runner.plain(code, this);

                } else {

                    const id = 'runner-' + this.module.resource.replace(/[^a-zA-Z0-1]*/g, '-') + '-' + (this.runners.length + 1);

                    this.runners.push({
                        id,
                        lang,
                        code,
                        name: this.module.name,
                        resource: this.module.resource
                    });

                    return `<div id="${id}"></div>`;

                }
            } else {
                return this.renderCode(code, lang);
            }
        },

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

        renderCode(code, lang) {

                return this.$doc.highlight(code, lang);

                // if (Markdown.extendRenderer.code) {
                //     return Markdown.extendRenderer.code(code, lang);
                // } else if (Prism.languages[lang]) {
                //     return `<pre><code class="language-${lang}">${Prism.highlight(code, Prism.languages[lang], lang)}</code></pre>`;
                // } else {
                //     return Markdown.baseRenderer.code(code, lang);
                // }
        },

        markdown(code) {
            return this.renderer.render(code)
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
