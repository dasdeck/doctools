<template>
    <component :is="data.type" :data="data"></component>
</template>

<script>

import Component from './Component.vue';
import Module from './Module.vue';
import Package from './Package.vue';

/**
 * component wrapper for the vue-router
 * @see https://github.com/vuejs/vue-router/issues/169
 */
export default {

  components: {
    UIkitComponent: Component,
    VueComponent: Component,
    Module: Module,
    Package
  },

  inject: ['$doc'],

  props: {
    /**
     * the address of the current resource
     * will be set by vue router
     */
    resource: String
  },

  computed: {
    /**
     * the data for the current content view.
     * the fata is dereferenced from the current's routes resource paremter
      */
    data() {
      return this.$doc.resources[this.resource];
    }
  }
}
</script>
