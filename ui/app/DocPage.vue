<template>
    <div v-if="data">

        <h1>
            {{data.name}}
        </h1>

         <template v-if="data.component && data.component.extends">
                <span class="inherited">
                    ↳ <ModuleLink :resource="data.component.extends.resource"/>
                </span>
            </template>

        <!-- This is the nav containing the toggling elements -->
        <ul uk-switcher class="uk-subnav uk-subnav-pill nomd">
            <li v-if="data.readme"><a href="">readme</a></li>
            <li v-if="apiHasContent"><a href="">api</a></li>
            <li v-if="globals"><a href="">globals</a></li>
            <li v-if="data.script"><a href="" >code</a></li>
            <li v-if="data.template"><a href="">template</a></li>
            <li v-if="data.tests"><a href="">test</a></li>
            <li v-if="data.markdown"><a href="">markdown</a></li>
        </ul>

        <!-- This is the container of the content items -->
        <div class="uk-switcher">
            <Markdown v-if="data.readme" :text="data.readme"/>
            <component v-if="apiHasContent" :is="data.type" :data="data" ref="layout"/>
            <Globals v-if="globals" :data="data.globals"/>
            <div v-if="data.script">
                <h2>code:</h2>
                <Code language="javascript">{{data.script}}</Code>
            </div>
            <div v-if="data.template">
                <h2>template:</h2>
                <template v-if="data.template.inherited">
                    : <ModuleLink :resource="data.template.inherited"/>
                </template>
                <Code :class="data.template.inherited && 'inherited'" language="html">{{data.template.template}}</Code>
            </div>
            <div v-if="data.tests">
                tests
            </div>
            <Markdown class="nomd" v-if="data.markdown" :text="data.markdown"/>
        </div>

        <hr>
        <i v-if="data.package">package: <ModuleLink :resource="data.package"/></i>
        <i v-if="repoLink">source: <a :href="repoLink">test</a></i>
    </div>
    <div v-else>
        select a module on the left
    </div>
</template>

<script>

    import Component from './types/Component.vue';
    import Module from './types/Module.vue';
    import Package from './types/Package.vue';
    import ModuleLink from './utils/ModuleLink.vue';
    import Globals from './utils/Globals.vue';
    import Markdown from './utils/Markdown.vue';
    import ModuleComp from './utils/ModuleComp.js';
    import _ from 'lodash';

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
            Globals,
            Markdown
        },

        ref: '$content',

        extends: ModuleComp,


        props: {
            /**
             * the address of the current resource
             * will be set by vue router
             */
            resource: [String, Object]
        },

        computed: {

            apiHasContent() {
                const comp = this.$options.components[_.upperFirst(this.data.type)];
                return comp && comp.hasContent && comp.hasContent(this.data);
            },

            globals() {
                return this.data.globals && _.size(this.data.globals);
            },

            repoLink() {
                if  (this.repo) {

                    const shorthands = {
                        'github:': 'https://github.com'
                    }

                    let url = this.repo.url;

                    if(!_.some(shorthands, (rep, ser) => url.includes(ser) && url.replace(ser, rep + '/'))) {
                        url = `${Object.values(shorthands)[0]}/${url}`;
                    }
                    return `${url}/tree/master/${this.repo.workspace}/${this.data.fileInPackage}`;
                }
            },

            repo() {

                const root = this.$doc.resources[this.$doc.data.rootPackage];
                const repo = root && root.packageJson && root.packageJson.repository;

                return repo;

            },

            /**
             * the data for the current content view.
             * the fata is dereferenced from the current's routes resource paremter
             */
            data() {
                return this.module;
            }
        }
    }
</script>
