<template>
    <div uk-grid>
        <label class="uk-width-1-4">
            show private members:
        <input class="uk-checkbox" type="checkbox" v-model="private">
        </label>
        <div  class="uk-width-3-4"></div>
        <Tree class="uk-width-1-4" :selected="selected" :data="data" @show="selected=$event"></Tree>
        <component :private="private" class="uk-width-3-4"  v-if="selected" :is="selected.type" :data="selected"></component>
    </div>
</template>

<script>
import Tree from './Tree.vue';
import Component from './Component.vue';
import Module from './Module.vue';
import _ from 'lodash';

export default {
    components: {
        Tree,
        Component,
        Module
    },

    props: {
        data: Object
    },

    data() {
        return {selected: null, private: false};
    },

    created() {
        this.selected = _.get(this.data, window.location.hash.substr(1));
    },

    computed: {
    }

}
</script>

<style>

</style>
