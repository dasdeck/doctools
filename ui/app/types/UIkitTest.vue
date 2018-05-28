<template>
    <iframe ref="iframe" height="100%" width="100%" :srcdoc="html"/>
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

            let html = template.replace('$rtl', this.$doc.settings.rtl ? 'rtl' : 'ltr');
            html = html.replace('$content', res => body);
            html = html.replace('$head', res => head);

            return html;

        }
    }

}
</script>

