<template>
    <div>
        <h2>{{ data.name }}:</h2>
        <Types v-if="data.type" :type="data.type"/>
        <Description :text="data.description"/>

    </div>
</template>

<script>

    import Types from './Types.vue';
    import ModuleComp from './ModuleComp.js';
    import Description from './Description.vue';

    /**
     * document layout for constants
     */
    export default {

        components: {
            Types,
            Description
        },

        extends: ModuleComp,

        props: {
            /**
             * the descriptor jsodc for this constant
             */
            data: Object,
        }
    };
</script>

