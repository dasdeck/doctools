<template>
    <div v-if="component.emit">
        <div v-html="$t('<h2>emits:</h2>')"></div>
        <div v-for="event in component.emit">
            <Function :data="event"/>
        </div>

    </div>
</template>

<script>

    import Base from './Base';
    import Function from '../../utils/Function.vue';

    export default {
        components:{
            Function
        },
        extends: Base
    }

</script>