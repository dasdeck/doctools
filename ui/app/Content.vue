<template>
<div>

<!-- This is the nav containing the toggling elements -->
<ul uk-switcher class="uk-subnav uk-subnav-pill">
    <li><a href="">doc</a></li>
    <li v-if="data.script"><a href="">code</a></li>
    <li v-if="data.template"><a href="">code</a></li>
    <li><a href="">test</a></li>
</ul>

<!-- This is the container of the content items -->
<ul class="uk-switcher">
    <li>
        <component :is="data.type" :data="data"></component>
    </li>
    <li>
        <Code language="javascript">{{data.script}}</Code>

    </li>
    <li>
        <Code language="html">{{data.template}}</Code>

    </li>
    <li>
        tests
    </li>
</ul>
</div>
</template>

<script>

    import Component from './types/Component.vue';
    import Module from './types/Module.vue';
    import Package from './types/Package.vue';

    /**
     * component wrapper for the vue-router
     * @see https://github.com/vuejs/vue-router/issues/169
     */
    export default {

        components: {
            UIkitComponent: Component,
            VueComponent: Component,
            Module: Module,
            Package
        },

        inject: ['$doc'],

        props: {
            /**
             * the address of the current resource
             * will be set by vue router
             */
            resource: String
        },

        computed: {
            /**
             * the data for the current content view.
             * the fata is dereferenced from the current's routes resource paremter
             */
            data() {
                return this.$doc.resources[this.resource];
            }
        }
    }
</script>
