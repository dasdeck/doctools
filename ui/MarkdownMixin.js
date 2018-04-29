import Turndown from 'turndown';
import {gfm} from 'turndown-plugin-gfm';
import UIkit from 'uikit';

import marked from 'marked';


const turndown = new Turndown({
    codeBlockStyle: 'fenced'
});
turndown.use(gfm);

export default {

    data() {
        return {
            markdown: '',
            reHtml: ''
        }
    },

    created() {

        if (this.$options.ref) {
            window[this.$options.ref] = this;
        }

    },

    methods: {
        createMarkdown() {

            const toMD = this.$el.cloneNode(true);
            UIkit.util.remove(UIkit.util.$$('.nomd', toMD));
            this.markdown = turndown.turndown(toMD.outerHTML);
            this.reHtml = marked(this.markdown);

        }
    }
}