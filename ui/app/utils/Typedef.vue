<template>
    <div>
        <h1>{{name}}</h1>
        <p>
            {{data.description}}
        </p>
    </div>
</template>

<script>

    /**
     * document layout for constants
     */
    export default {
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

