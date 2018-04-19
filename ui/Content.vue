<template>
    <component :is="data.type" :data="data" :options="options"></component>
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
      options: Object,
      data: Object
  }
}
</script>
