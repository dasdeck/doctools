<template>
    <span v-if="type">
        <Type :type="t" v-for="t in type.names"/>
    </span>
</template>

<script>

import Type from './Type.vue';

export default {
    components : {
        Type
    },

    inject: ['$doc'],
    
    props: {
        module: {
            type: Object,
            default() {
                return this.$doc.selectedModule;
            }
        },
        type: Object
    },

}
</script>

<style>

</style>
