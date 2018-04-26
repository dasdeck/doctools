<template>
    <div>
        <div v-if="data" uk-grid>
            <div class="uk-width-1-4">
                <label>
                    show private members:
                    <input class="uk-checkbox" type="checkbox" v-model="settings.private">
                </label>

                <input type="text" v-model="settings.filter">

                <PackageTree :data="resources[data.rootPackage]"/>
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

    /**
     * Container Component for the doctools app ui
     */
    export default {

        components: {
            PackageTree
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

        computed: {
            resources() {
                return this.data && this.data.resources || {};
            }
        }

    }
</script>
