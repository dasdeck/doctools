import Prism from 'prismjs';
import marked from 'marked';
import DocBase from './DocBase';

export default {

    extends: DocBase,

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
    }

};