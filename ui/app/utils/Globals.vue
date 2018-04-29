<template>
<div>
    <template v-for="(group, name) in data" >
        <h2>{{name}}</h2>
        <component :key="group.longname" :is="el.template" v-for="el in group" :data="el"/>
    </template>
</div>
</template>

<script>
import Function from './Function.vue';

export default {

    components: {
        Function
    },


    props: {
        data: Object,
        module: Object
    }

}
</script>

<style>

</style>
