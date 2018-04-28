<template>
  <div>
      <ModuleLink :name="realName" :resource="resource" @click="open=true"/>
      <template v-if="hasChilren">
        <span @click="open=!open">{{open ? '-' : '+'}}</span>
        <ul v-show="open">
            <FileTreeItem v-for="(data, name) in children" :data="data" :name="name"/>
        </ul>
      </template>
  </div>
</template>

<script>

import ModuleLink from './utils/ModuleLink.vue';
 const FileTreeItem = {

    props: {
        data: Object,
        name: {
            type: String,
            default() {
                return this.data['::'] && this.data['::'].name;
            }
        }
    },

    data() {
        return {open: true}
    },

    computed: {

        hasChilren() {
            return _.size(this.children);
        },
        children() {
            return _.pickBy(this.data, (val, key) => key !== '::');
        },

        desc() {
            return this.data['::'];
        },

        resource() {
            return this.desc && this.desc.resource;
        },

        realName() {
            return this.name.replace(/::/g, '.');
        }
    }

};

FileTreeItem.components = {
    FileTreeItem,
    ModuleLink
};

export default FileTreeItem;

</script>

<style>

</style>
