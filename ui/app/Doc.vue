<template>
    <div>
        <div v-if="data" uk-grid>
            <div class="uk-width-1-4">
                <label>
                    show private members:
                    <input class="uk-checkbox" type="checkbox" v-model="settings.private">
                </label>

                <label>
                    filter:
                    <input type="text" v-model="settings.filter">
                </label>

                <ul v-if="_.size(data.config.menus) > 1" uk-switcher class="uk-subnav uk-subnav-pill">
                    <li v-if="data.menu && data.config.menus.menu"><a href="">menu</a></li>
                    <li v-if="data.config.menus.packages"><a href="">packages</a></li>
                    <li v-if="data.config.menus.files"><a href="">files</a></li>
                </ul>
                <div :class="(_.size(data.config.menus) > 1) && 'uk-switcher'">
                    <Menu v-if="data.menu && data.config.menus.menu" :menu="data.menu"/>
                    <PackageTree v-if="data.config.menus.packages" :data="resources[data.rootPackage]"/>
                    <FileTree v-if="data.config.menus.files" :resources="resources"/>
                </div>
            </div>

            <router-view class="uk-width-3-4"/>

        </div>
        <div v-else>
            waiting for data...
        </div>
    </div>
</template>

<script>

    import PackageTree from './sidebar/PackageTree.vue';
    import FileTree from './sidebar/FileTree.vue';
    import Menu from './sidebar/Menu.vue';
    import DocBase from './DocBase.js';

    /**
     * Container Component for the doctools app ui
     */
    export default {

        components: {
            PackageTree,
            FileTree,
            Menu
        },

        extends: DocBase,

        provide() {
            return {
                $doc: this
            };
        },


        ref: '$doc',

        // watch:{
        //     data(data) {
        //         if(data && !this.selectedModule) {
        //             // this.$router.push('/' + data.rootPackage);
        //         }
        //     }
        // },

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

        }


    }
</script>
