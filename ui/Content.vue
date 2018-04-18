<template>
    <component :is="data.type" :data="data" :private="private"></component>
</template>

<script>

import Component from './Component.vue';
import Module from './Module.vue';
import Package from './Package.vue';

export default {

  components: {
    UIkitComponent: Component,
    VueComponent: Component,
    Module: Module,
    Package
  },

  props: {
      private: Boolean,
      data: Object
  }
}
</script>
