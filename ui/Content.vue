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

  props: {
      resource: String,
      resources: Object
  },

  computed: {
    data() {
      return this.resources[this.resource];
    }
  }
}
</script>
