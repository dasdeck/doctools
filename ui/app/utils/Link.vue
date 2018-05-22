<template>
    <a v-if="isExternalLink" :href="url" v-html="title"><slot></slot></a>
    <ModuleLink v-else :resource="resource" :name="name"/>
</template>

<script>

    import ModuleComp from './ModuleComp';
    import ModuleLink from './ModuleLink.vue';
    export default {

        extends: ModuleComp,

        components: {
            ModuleLink
        },

        props: {
            link: String
        },

        computed: {

            name() {
                return this.$slots.default && this.$slots.default[0] && this.$slots.default[0].text;
            },

            isExternalLink() {
                return this.link.trim().indexOf('http') === 0;
            },

            url() {
                return this.link.trim().split(' ').shift();
            },

            title() {
                return this.link.trim().split(' ').pop();
            },

            resource() {
                return this.$doc.resolveModule(this.link);
            }

        }

    };
</script>