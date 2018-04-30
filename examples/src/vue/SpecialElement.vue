<template>

</template>

<script>

import Element from './Element.vue';

export default {
    extends: Element,
    computed: {

        /**
         * a fucking test memebers
         * @private
         * @type {String}
        */
        myPrivateMember() {
            return "test"
        }
    }
}

</script>

<style>

</style>
