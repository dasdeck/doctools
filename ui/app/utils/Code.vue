<template>
    <div v-html="html">
        <slot></slot>
    </div>
</template>

<script>

    import ModuleComp from './ModuleComp.js';

    export default {

        extends: ModuleComp,

        props: {
            language: String,
            code: String
        },

        computed: {
            html() {
                return this.$doc.highlight(this.code || this.$slots.default[0].text, this.language, true);
            }
        }

    };

</script>