<template>
    <component :is="data.type" :data="data" :private="private"></component>
</template>

<script>

import Component from './Component.vue';
import Module from './Module.vue';

export default {

  components: {
    UIkitComponent: Component,
    Vue: Component,
    Module
  },

  props: {
      private: Boolean,
      data: Object
  }
}
</script>
