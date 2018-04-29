<template>
    <div>

        <h1>
            {{data.name}}
            <template v-if="data.component && data.component.extends">
                <code>
                    <span>extends</span>
                    <ModuleLink :resource="data.component.extends.resource"/>
                </code>
            </template>
        </h1>

        <!-- This is the nav containing the toggling elements -->
        <ul uk-switcher class="uk-subnav uk-subnav-pill nomd">
            <li><a href="">api</a></li>
            <li v-if="data.globals"><a href="">globals</a></li>
            <li v-if="data.script"><a href="">code</a></li>
            <li v-if="data.template"><a href="">template</a></li>
            <li v-if="data.tests"><a href="">test</a></li>
            <li><a href="">markdown</a></li>
        </ul>

        <!-- This is the container of the content items -->
        <div class="uk-switcher">
            <div>
                <component :is="data.type" :data="data"></component>
            </div>
            <div v-if="data.globals">
                <Globals :data="data.globals"/>
            </div>
            <div v-if="data.script">
                <h2>code:</h2>
                <Code language="javascript">{{data.script.replace(/`/g, '(`)')}}</Code>
            </div>
            <div v-if="data.template">
                <h2>template:</h2>
                <template v-if="data.template.inherited">
                    inherited from: <ModuleLink :resource="data.template.inherited"/>
                </template>
                <Code :class="data.template.inherited && 'inherited'" language="html">{{data.template.template}}</Code>
            </div>
            <div v-if="data.tests">
                tests
            </div>
            <div v-html="reHtml">
            </div>
            <div v-html="markdown">
            </div>
        </div>
    </div>
</template>

<script>

    import Component from './types/Component.vue';
    import Module from './types/Module.vue';
    import Package from './types/Package.vue';
    import ModuleLink from './utils/ModuleLink.vue';
    import Globals from './utils/Globals.vue';

    /**
     * component wrapper for the vue-router
     * @see https://github.com/vuejs/vue-router/issues/169
     */
    export default {

        components: {
            UIkitComponent: Component,
            VueComponent: Component,
            Module: Module,
            Package,
            ModuleLink,
            Globals
        },

        ref: '$content',

        inject: ['$doc'],

        props: {
            /**
             * the address of the current resource
             * will be set by vue router
             */
            resource: String
        },

        watch: {
            data() {
                this.createMarkdown();
            }
        },

        mounted() {
            this.createMarkdown();
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
