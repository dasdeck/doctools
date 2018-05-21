<template>
    <div>
        <h2>{{name}}</h2>
        <Description :text="data.description"/>
    </div>
</template>

<script>
    import Description from '../utils/Description.vue';
    /**
     * document layout for constants
     */
    export default {

        components: {
            Description
        },
        props: {
            /**
             * the descriptor jsodc for this constant
             */
            data: Object
        },

        computed: {
            name() {
                return this.data.type && this.data.type.names[0] || this.data.longname;
            }
        }
    }
</script>

