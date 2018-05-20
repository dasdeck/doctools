<template>
    <div>
        <div v-if="data" uk-grid>
            <div class="uk-width-1-4">
                <label>
                    {{$t('show private members:')}}
                    <input class="uk-checkbox" type="checkbox" v-model="settings.private">
                </label>

                <label>
                    {{$t('filter:')}}
                    <input type="text" v-model="settings.filter">
                </label>

                <template v-if="">
                    <ul  uk-switcher class="uk-subnav uk-subnav-pill">
                        <li v-if="data.menu && data.config.menus.menu"><a href="">menu</a></li>
                        <li ><a href="">packages</a></li>
                        <li ><a href="">files</a></li>
                    </ul>
                    <div :class="'uk-switcher'">
                        <Menu v-if="data.menu && data.config.menus.menu" :menu="data.menu"/>
                        <PackageTree :data="resources[data.rootPackage]"/>
                        <FileTree  :resources="resources"/>
                    </div>
                </template>
            </div>

            <router-view class="uk-width-3-4"/>

        </div>
        <div v-else>
        <div class="uk-position-center" style="text-align:center;">

            <div uk-spinner></div>
            <div v-html="$t('waiting for data...')"></div>
        </div>
        </div>
    </div>
</template>

<script>

    import PackageTree from './sidebar/PackageTree.vue';
    import FileTree from './sidebar/FileTree.vue';
    import Menu from './sidebar/Menu.vue';
    import DocApp from './DocApp.js';
    import {size} from 'lodash'

    /**
     * Container Component for the doctools app ui
     */
    export default {

        components: {
            PackageTree,
            FileTree,
            Menu
        },

        extends: DocApp,

        ref: '$doc',

        computed: {

            selectedPackage() {
                const resource = this.selectedModule;
                if (resource) {
                    return resource && this.resources[resource.type === 'package' ? resource.resource : resource.package];
                }
            },

            selectedModuleResource() {
                return this.$route.fullPath.substr(1);
            },

            selectedModule() {
                return this.resources[this.selectedModuleResource];
            }

        },

        methods: {
            size
        }


    }
</script>
