
<template>
    <div>
        <label>
            RTL
            <input type="checkbox" v-model="rtl"/>
        </label>
        <iframe ref="iframe" width="100%" :srcdoc="html"/>
    </div>
</template>

<script>

import ModuleComp from '../utils/ModuleComp.js';
import template from '!raw-loader!./UIkitTest.html';

function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div;
}

export default {
    extends: ModuleComp,

    ref: '$tester',

    data() {
        return {rtl: false};
    },

    mounted() {
        this.$refs.iframe.onload = res => {
            this.$refs.iframe.height = this.$refs.iframe.contentWindow.document.body.scrollHeight;
        }
    },

    computed: {
        html() {

            const sourceHTML = createElementFromHTML(this.module.html);

            const headEls = UIkit.util.toNodes(sourceHTML.children)
                                    .filter(node => node.tagName === 'STYLE');

            UIkit.util.remove(headEls);
            UIkit.util.remove(UIkit.util.$$('meta', sourceHTML));
            UIkit.util.remove(UIkit.util.$$('title', sourceHTML));
            UIkit.util.remove(UIkit.util.$$('script[src="js/test.js"]', sourceHTML));


            const head = headEls.map(node => node.outerHTML)
                                    .join('\n');

            const body = sourceHTML.innerHTML.trim();

            debugger

            let html = template.replace('$rtl', this.rtl ? 'rtl' : 'ltr');
            html = html.replace('$content', body);
            html = html.replace('$head', head);
            return html;
        }
    }

}
</script>

