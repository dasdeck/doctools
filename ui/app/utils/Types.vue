<template>
    <span v-if="type">
        <Type :type="t" v-for="(t, key) in type.names" :key="key"/>
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
        type: Object
    },

}
</script>

<style>

</style>
