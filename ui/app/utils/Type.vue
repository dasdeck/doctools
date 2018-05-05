<template>
    <span>
        <template v-if="isComplexType">
            <Type :type="primeType"/>.(<Type v-for="(t,i) in secondaryTypes" :key="t" :type="t" :comma="i < secondaryTypes.length - 1"/>)
        </template>
        <ModuleLink v-else-if="types[type]" :resource="types[type]" :name="primeType"/>
        <a v-else-if="apiDocLink" :href="apiDocLink">{{primeType}}</a>
        <span v-else>{{primeType}}</span>
        <span v-if="comma">, </span>
    </span>
</template>

<script>

import ModuleLink from './ModuleLink.vue';
import _ from 'lodash';
import ModuleComp from './ModuleComp.js';

const Type = {

    props: {
        comma: Boolean,
        type: String
    },

    extends: ModuleComp,

    computed: {

        types() {
            return this.$doc.types || {};
        },

        subTypes() {
            return this.type.split('.');
        },

        secondaryTypes() {

            return this.subTypes[1].replace(/</g, '').replace(/>/g, '').split(',').map(t => t.trim());
        },

        primeType() {
            const type = this.subTypes[0].trim();
            const wrongCase = ['function'].includes(type);
            return wrongCase ? _.upperFirst(type) : type;
        },

        isComplexType() {
            return this.subTypes.length > 1;
        },

        apiDocLink() {
            if(this.$doc.data.globals.includes(this.primeType)) {
                return `https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/${this.type}`;
            } else if(window[this.primeType]) {
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
