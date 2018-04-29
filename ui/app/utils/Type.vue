<template>
    <span>
        <template v-if="isComplexType">
            <Type :type="primeType"/>.<<Type v-for="(t,i) in secondaryTypes" :type="t" :comma="i < secondaryTypes.length - 1"/>>
        </template>
        <ModuleLink v-else-if="types[type]" :resource="types[type]" :name="type"/>
        <a v-else-if="apiDocLink" :href="apiDocLink">{{type}}</a>
        <span v-else>{{type}}</span>
        <span v-if="comma">, </span>
    </span>
</template>

<script>

import ModuleLink from './ModuleLink.vue';

const Type = {
    
    props: {
        comma: Boolean,
        module: {
            type: Object,
            default() {
                return this.$doc.selectedModule;
            }
        },
        type: String
    },

    inject: ['$doc'],

    computed: {
        
        types() {
            // const res = this.$doc.types[this.module.type === 'package' ? this.module.resource : this.module.package];
            // if (!res) {
            //     debugger;
            // }
            return this.$doc.types || {};
        },

        subTypes() {
            return this.type.split('.');
        },

        secondaryTypes() {
            
            return this.subTypes[1].replace(/</g, '').replace(/>/g, '').split(',').map(t => t.trim());
        },

        primeType() {
            return this.subTypes[0].trim();
        },

        isComplexType() {
            return this.subTypes.length > 1;
        },

        apiDocLink() {
            if(this.$doc.data.globals.includes(this.type)) {
                return `https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/${this.type}`;
            } else if(window[this.type]) {
                return `https://developer.mozilla.org/docs/Web/API/${this.type}`;
            }
        }
    }
}

Type.components = {
    ModuleLink,
    Type
};

export default Type;

</script>

<style>

</style>
