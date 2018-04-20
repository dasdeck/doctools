<template>
    <div uk-grid>
        <div class="uk-width-1-4">
            <label >
                show private members:
                <input class="uk-checkbox" type="checkbox" v-model="settings.private">
            </label>

            <input type="text" v-model="settings.filter">

            <PackageTree :data="data" />
        </div>
        <router-view class="uk-width-3-4" ></router-view>
    </div>
</template>

<script>
import PackageTree from './PackageTree.vue';

import _ from 'lodash';

/**
 * Container Component for the doctools app ui
 */
export default {

    components: {
        PackageTree
    },


    props: {
        /**
         * the main data returned from the doctool parser
         * currently ony supporting packages!
         */
        data: Object
    },

    provide() {
        return {
            $resources: this.data.resources,
            $settings: this.settings
        };
    },

    data() {
        return {
            /**
             * the selected module/component
             */
            selected: null,

            /**
             * general application wide settings
             */
            settings: {
                private:false,
                filter:''
            }

        };
    },

    created() {
        this.selected = _.get(this.data, window.location.hash.substr(1));
    },

}
</script>

<style>

</style>
