<template>
    <div uk-grid>
        <label class="uk-width-1-4">
            show private members:
        <input class="uk-checkbox" type="checkbox" v-model="options.private">
        </label>
        <div  class="uk-width-3-4"></div>
        <Tree class="uk-width-1-4" :selected="selected" :data="data" @show="selected = $event"></Tree>
        <router-view class="uk-width-3-4" :options="options" ></router-view>
    </div>
</template>

<script>
import Tree from './Tree.vue';
import _ from 'lodash';

/**
 * Container Component for the doctools app ui
 */
export default {

    components: {
        Tree
    },


    props: {
        /**
         * the main data returned from the doctool parser
         * currently ony supporting packages!
         */
        data: Object
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
            options: {
                private:false
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
