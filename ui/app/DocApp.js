import Prism from 'prismjs';
import marked from 'marked';
import DocBase from './DocBase';

export default {

    extends: DocBase,

    computed: {
        selectedPackage() {
            const resource = this.selectedModule;
            if (resource) {
                return resource && this.resources[resource.type === 'package' ? resource.resource : resource.package];
            }
        },

        selectedModuleResource() {
            return decodeURI(this.$route.fullPath).substr(1);
        },

        selectedModule() {
            return this.resources[this.selectedModuleResource];
        }
    },

    methods: {

        markdown(markdown) {

            marked.Lexer.rules.normal.code = {exec: () => false};
            marked.Lexer.rules.gfm.code = {exec: () => false};
            marked.Lexer.rules.tables.code = {exec: () => false};

            return marked(markdown, {
                highlight: (code, lang) => {
                    return this.highlight(code, lang);
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
    }

};