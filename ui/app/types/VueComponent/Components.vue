<template>
    <div v-if="component.components">
        <div v-html="$t('<h2>components:</h2>')"/>
        <div v-for="comp in component.components">
            <ModuleLink :resource="comp.resource"/>
        </div>
        <hr>
    </div>
</template>

<script>

    import ModuleLink from '../../utils/ModuleLink.vue';
    import Base from './Base';

    export default {

        components: {
            ModuleLink
        },

        extends: Base
    }

</script>