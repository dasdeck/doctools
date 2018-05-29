<template>
    <div>
        <template v-for="(group, name) in data" >
            <h2>{{ name }}:</h2>
            <component v-for="el in group" :key="el.longname" :is="el.template" :data="el"/>
        </template>
    </div>
</template>

<script>
    import Function from './Function.vue';
    import ModuleComp from './ModuleComp.js';

    export default {

        components: {
            Function
        },

        extends: ModuleComp,

        props: {
            data: Object,
        }

    };
</script>

<style>

</style>
