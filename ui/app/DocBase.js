import Prism from 'prismjs';
import marked from 'marked';

export default {

    props: {
        initialData: Object
    },

    data() {
        return {
            data: this.initialData,
            lastRuntime: null,
            settings: {
                private: false,
                filter: ''
            }

        }
    },

    provide() {
        return {$doc: this}
    },

    methods: {

        markdown(markdown) {

            return marked(markdown, {
                highlight: (code, lang) => {
                    return this.highlight(code,lang);
                }
            });

        },

        highlight(code, lang, frame = false) {

             if (Prism.languages[lang]) {
                 const html = Prism.highlight(code, Prism.languages[lang], lang);
                return frame ? `<pre><code class="language-${lang}">${html}</code></pre>` : html;
            }

            return code;
        }
    },

    computed: {

        uriPrefix() {
            return "/";
        },

        runtime() {
            if (this.data.runtime && this.data.runtime !== this.lastRuntime) {
                this.lastRuntime = this.data.runtime;
                eval(this.data.runtime);
            }
            return window.RuntimeAnalyzer && window.RuntimeAnalyzer.default;
        },

        nodeGlobals() {
            return this.data.nodeGlobals;
        },

        types() {
            return this.data && this.data.types || {};
        },

        resources() {
            return this.data && this.data.resources || {};
        },

        rootPackage() {
            return this.resources[this.data.rootPackage];
        },


        repo() {
            const root = this.rootPackage;
            return root && root.packageJson && root.packageJson.repository;

        }

    }

};