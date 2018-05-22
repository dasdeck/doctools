<template>
    <div v-if="module">

        <div class="nomd">

            <h1>{{module.name}}</h1>
            <Description/>
            <hr>

        </div>

         <template v-if="module.component && module.component.extends">
                <span class="inherited">
                    ↳ <ModuleLink :resource="module.component.extends.resource"/>
                </span>
        </template>

        <!-- This is the nav containing the toggling elements -->
        <ul uk-switcher class="uk-subnav uk-subnav-pill nomd">
            <li v-if="module.assets"><a href="">assets</a></li>
            <li v-if="apiHasContent"><a href="">api</a></li>
            <li v-if="globals"><a href="">globals</a></li>
            <li v-if="module.code"><a href="" >code</a></li>
            <li v-if="module.template"><a href="">template</a></li>
            <li v-if="module.tests"><a href="">test</a></li>
            <li v-if="module.markdown"><a href="">markdown</a></li>
        </ul>

        <!-- This is the container of the content items -->
        <div class="uk-switcher mdnoclass">

            <Assets v-if="module.assets" :assets="module.assets"/>
            <component v-if="apiHasContent" :is="module.type" :moduleProperty="module" ref="layout"/>
            <Globals v-if="globals"/>
            <div v-if="module.code">
                <h2>code:</h2>
                <Code :language="module.code.trim()[0] === '<' ? 'html' : 'javascript'">{{module.code}}</Code>
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
        <i class="nomd" v-if="module.package">package: <ModuleLink :resource="module.package"/></i>
    </div>
    <div v-else v-html="$t('select a module on the left')"></div>
</template>

<script>

    import Types from './types';
    import utils from './utils';
    import Assets from './utils/Assets.vue';

    import Globals from './utils/Globals.vue';
    import ModuleComp from './utils/ModuleComp.js';
    import {some, size, upperFirst} from 'lodash-es';

    /**
     * component wrapper for the vue-router
     * @see https://github.com/vuejs/vue-router/issues/169
     */
    export default {

        components: {
            ...Types,
            ...utils,
            Assets,
            Globals
        },

        ref: '$content',

        extends: ModuleComp,

        provide() {
            return {$page: this};
        },

        methods: {

            toHtml() {

                const toMD = this.$el.cloneNode(true);

                const {$$, remove} = require('uikit').util;

                UIkit.util.remove(UIkit.util.$$('.nomd', toMD));
                UIkit.util.attr(UIkit.util.$$('.mdnoclass', toMD), 'class', '');

                return toMD.outerHTML;
            }
        },

        computed: {

            apiHasContent() {
                const comp = this.$options.components[upperFirst(this.module.type)];
                return comp && comp.hasContent && comp.hasContent(this.module) || true;
            },

            globals() {
                return this.module.globals && size(this.module.globals);
            },



        }
    }
</script>
