<template>
<div>
    <template v-for="(group, name) in data" >
        <h2>{{name}}:</h2>
        <component :key="group.longname" :is="el.template" v-for="el in group" :data="el"/>
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

}
</script>

<style>

</style>
