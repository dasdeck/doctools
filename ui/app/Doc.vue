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

                <ul uk-switcher class="uk-subnav uk-subnav-pill">
                    <li><a href="">packages</a></li>
                    <li><a href="">files</a></li>
                </ul>
                <ul class="uk-switcher">
                    <li>
                        <PackageTree :data="resources[data.rootPackage]"/>

                    </li>
                    <li>
                        <FileTree :resources="resources"/>
                    </li>
                </ul>
            </div>
            <router-view class="uk-width-3-4"/>

            <Content style="display:none;" :resource="res.resource" v-for="res in resources" ref="markdown"/>

        </div>
        <div v-else>
            waiting for data...
        </div>
    </div>
</template>

<script>

    import PackageTree from './PackageTree.vue';
    import FileTree from './FileTree.vue';
    import {getShallowContet} from '../MarkdownExporter';
    import Content from './Content.vue';

    /**
     * Container Component for the doctools app ui
     */
    export default {

        components: {
            PackageTree,
            FileTree,
            Content
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

                /**
                 * general application wide settings
                 */
                settings: {
                    private: false,
                    filter: ''
                }

            };
        },

        created() {
            debugger;
        },

        ref: '$doc',
        
        methods: {

            allMarkdown() {

                console.log('test')

                const res = _.map(this.$refs.markdown, comp => {

                    return comp.markdown;

                });

                // debugger;
            }

        },

        computed: {

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
                return this.resources[this.$route.params.resource];
            }

        }


    }
</script>
