<template>
    <span v-if="repoLink" v-html="html"></span>
</template>

<script>

import ModuleComp from './ModuleComp.js';

export default {

    extends: ModuleComp,

    computed: {
        html() {
            return this.$t('<a href="$repoLink">edit in repo</a>', {repoLink: this.repoLink});
        }
    }

};

</script>