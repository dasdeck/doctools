<template>
    <div>
        <div v-html="html"></div>
    </div>
</template>

<script>

import ExampleRunner, {Registry} from '../utils/ExampleRunner.vue';
import ModuleComp from '../utils/ModuleComp.js';

const Markdown = {

    extendRenderer: {},

    props: {
        text: String,
    },

    extends: ModuleComp,

    data() {

        return {
            runners: [],
            replacements: []
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

        preprocess(markdown) {

            this.replacements = [];

            this.processCodeBlocks(markdown, ([text, fence, lang, code]) => {

                if (lang.includes(':')) {

                    const replacement = this.addRunner(code, lang.split(':').map(e => e.trim()));
                    const placeholder = `<replace>${this.replacements.length}</replace>`;
                    markdown = markdown.replace(text, placeholder);
                    this.replacements.push({placeholder, replacement});
                    // this.replacements

                }
            });

            return markdown;

        },

        postprocess(html) {

            this.replacements.forEach(replacer => {
                html = html.replace(replacer.placeholder, replacer.replacement);
            });
            return html;
        },

        processCodeBlocks(text, callback = x => x, fences = ['```']) {

            fences = Array.isArray(fences) && fences || [fences];
            const reg = new RegExp(/(fences)(.*)\n((?:\r\n|\n|.)*?)\n\1/.source.replace('fences', fences.join('|')), 'g');
            let res;

            while (res = reg.exec(text)) {
                callback && callback(res);
            }

        },

        addRunner(code, [lang, runnerName]) {

            if (Registry.runners[runnerName]) {

                const runner = Registry.runners[runnerName];

                if (runner && runner.plain) {

                    return runner.plain(code, this);

                } else {

                    const id = 'runner-' + this.module.resource.replace(/[^a-zA-Z0-9]/g, '-') + '-' + (this.runners.length + 1);

                    this.runners.push({
                        id,
                        lang,
                        runnerName,
                        code,
                        name: this.module.name,
                        resource: this.module.resource
                    });

                    return `<div id="${id}"></div>`;

                }
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

                        const ExampleRunnnerComp = this.constructor.extend(ExampleRunner);
                        data.instance = new ExampleRunnnerComp({propsData: {data, dynamicRuntime}, el});

                    } else if (retry) {

                        this.$nextTick(res => {
                            this.updateExampleRunners(false);
                        });

                    } else {

                        throw 'unable to mount runners';

                    }

                }
            });
        },

        renderCode(code, lang, frame) {

            return this.$doc.highlight(code, lang, frame);
        },

        markdown(markdown) {
            markdown = this.preprocess(markdown);
            const html = this.$doc.markdown(markdown);
            return this.postprocess(html);

        }
    },

    computed: {

        sourceText() {
            return this.text;
        },

        html() {
            return this.sourceText && this.markdown(this.sourceText);
        }

    }
};

export default Markdown;

</script>

<style>

</style>
