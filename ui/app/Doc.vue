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

    import PackageTree from './PackageTree.vue';
    import FileTree from './FileTree.vue';
    import Content from './Content.vue';
    import Menu from './Menu.vue';

    /**
     * Container Component for the doctools app ui
     */
    export default {

        components: {
            PackageTree,
            FileTree,
            Content,
            Menu
        },

        props: {

            /**
             * the main data returned from the doctool parser
             * currently ony supporting packages!
             */
            initialData: {
                required: false,
                type: Object
            }

        },

        provide() {
            return {
                $doc: this
            };
        },

        data() {
            return {

                data: this.initialData,

                lastRuntime: null,

                /**
                 * general application wide settings
                 */
                settings: {
                    private: false,
                    filter: ''
                }

            };
        },

        ref: '$doc',


        computed: {

            runtime() {
                if (this.data.runtime && this.data.runtime !== this.lastRuntime) {
                    this.lastRuntime = this.data.runtime;
                    eval(this.data.runtime);
                }
                return window.VueRunnerRuntime && window.VueRunnerRuntime.default;
            },

            types() {
                return this.data && this.data.types || {};
            },

            resources() {
                return this.data && this.data.resources || {};
            },

            selectedPackage() {
                const resource = this.selectedModule;
                if (!resource) {
                    debugger;
                }
                return resource && this.resources[resource.type === 'package' ? resource.resource : resource.package];
            },

            selectedModule() {
                return this.resources[this.$route.fullPath];
            }

        }


    }
</script>
