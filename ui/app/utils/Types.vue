<template>
    <span v-if="type">
        <template v-for="t in type.names">
            <ModuleLink :resource="types[t]" :name="t"/>
        </template>
    </span>
</template>

<script>

import ModuleLink from './ModuleLink.vue';

export default {
    components : {
        ModuleLink
    },

    props: {
        module: Object,
        type: Object
    },

    inject: ['$doc'],

    computed: {
        types() {
            return this.$doc.resources[this.module.package || this.module.resource].types;
        }
    }

}
</script>

<style>

</style>
