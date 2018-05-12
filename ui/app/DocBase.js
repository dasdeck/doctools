import Prism from 'prismjs';

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
        highlight(code, lang) {

             if (Prism.languages[lang]) {
                return `<pre><code class="language-${lang}">${Prism.highlight(code, Prism.languages[lang], lang)}</code></pre>`;
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