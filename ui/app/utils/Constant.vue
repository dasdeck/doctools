<template>
    <div>
        <h2>{{data.name}}:</h2>
        <Types v-if="data.type" :type="data.type"/>
        <p>
            {{data.description}}
        </p>
    </div>
</template>

<script>

    import Types from './Types.vue';
    import ModuleComp from './ModuleComp.js';

    /**
     * document layout for constants
     */
    export default {

        components: {
            Types
        },

        extends: ModuleComp,

        props: {
            /**
             * the descriptor jsodc for this constant
             */
            data: Object,
        }
    }
</script>

