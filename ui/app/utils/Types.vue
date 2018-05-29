<template>
    <span v-if="type">
        <Type v-for="(t, index) in type.names" :key="index" :type="t" :seperator="seperator" :comma="index < type.names.length - 1"/>
    </span>
</template>

<script>

import Type from './Type.vue';
import ModuleComp from './ModuleComp.js';

export default {
    components: {
        Type
    },

    extends: ModuleComp,

    props: {
        type: Object,
        seperator: {
            type: String,
            default: ', '
        }
    },

};
</script>

<style>

</style>
