<template>
  <div v-html="html">
  </div>
</template>

<script>

import marked from 'marked';

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
