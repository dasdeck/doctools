<template>
  <div v-html="html">
  </div>
</template>

<script>

import marked from 'marked';
import Prism from 'prismjs';

marked.setOptions({
    highlight: function (code, lang) {
        if (Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
        } else {

            return code;
        }
    }
});

export default {
    props:{
        text: String
    },

    computed: {
        html() {
            return this.text && marked(this.text);
        }
    }
}
</script>

<style>

</style>
