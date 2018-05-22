<template>
    <span v-if="type">
        <Type :type="t" v-for="(t, index) in type.names" :key="index" :seperator="seperator" :comma="index < type.names.length - 1"/>
    </span>
</template>

<script>

import Type from './Type.vue';
import ModuleComp from './ModuleComp.js'

export default {
    components : {
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

}
</script>

<style>

</style>
