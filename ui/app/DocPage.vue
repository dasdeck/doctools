<template>
    <div v-if="module">

        <h1>
            {{module.name}}
        </h1>

        {{module.description}}
        <hr>


         <template v-if="module.component && module.component.extends">
                <span class="inherited">
                    ↳ <ModuleLink :resource="module.component.extends.resource"/>
                </span>
            </template>

        <!-- This is the nav containing the toggling elements -->
        <ul uk-switcher class="uk-subnav uk-subnav-pill nomd">
            <li v-if="module.readme"><a href="">readme</a></li>
            <li v-if="apiHasContent"><a href="">api</a></li>
            <li v-if="globals"><a href="">globals</a></li>
            <li v-if="module.script"><a href="" >code</a></li>
            <li v-if="module.template"><a href="">template</a></li>
            <li v-if="module.tests"><a href="">test</a></li>
            <li v-if="module.markdown"><a href="">markdown</a></li>
        </ul>

        <!-- This is the container of the content items -->
        <div class="uk-switcher">
            <Markdown v-if="module.readme" :text="module.readme"/>
            <component v-if="apiHasContent" :is="module.type" :data="module" ref="layout"/>
            <Globals v-if="globals"/>
            <div v-if="module.script">
                <h2>code:</h2>
                <Code language="javascript">{{module.script}}</Code>
            </div>
            <div v-if="module.template">
                <h2>template:</h2>
                <template v-if="module.template.inherited">
                    : <ModuleLink :resource="module.template.inherited"/>
                </template>
                <Code :class="module.template.inherited && 'inherited'" language="html">{{module.template.template}}</Code>
            </div>
            <div v-if="module.tests">
                tests
            </div>
            <Markdown class="nomd" v-if="module.markdown" :text="module.markdown"/>
        </div>

        <hr>
        <i v-if="module.package">package: <ModuleLink :resource="module.package"/></i>
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
    import {some, size, upperFirst} from 'lodash-es';

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

        provide() {
            return {$page: this};
        },

        computed: {

            apiHasContent() {
                const comp = this.$options.components[upperFirst(this.module.type)];
                return comp && comp.hasContent && comp.hasContent(this.module);
            },

            globals() {
                return this.module.globals && size(this.module.globals);
            },

            repoLink() {
                if  (this.$doc.repo) {

                    const shorthands = {
                        'github:': 'https://github.com'
                    }

                    let url = this.$doc.repo.url;

                    if(!some(shorthands, (rep, ser) => url.includes(ser) && url.replace(ser, rep + '/'))) {
                        url = `${Object.values(shorthands)[0]}/${url}`;
                    }

                    return `${url}/tree/master/${this.$doc.repo.workspace || ''}/${this.module.fileInPackage}`;
                }
            },

        }
    }
</script>
