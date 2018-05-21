<template>
    <span>
        <template v-if="isComplexType">
            <Type :type="primeType"/>.&lt;<Type v-for="(t,i) in secondaryTypes" :key="t" :type="t" :comma="i < secondaryTypes.length - 1"/>&gt;
        </template>
        <ModuleLink v-else-if="types[type]" :resource="types[type]" :name="primeType"/>
        <a v-else-if="apiDocLink" :href="apiDocLink">{{primeType}}</a>
        <span v-else>{{primeType}}</span>
        <template v-if="comma">, </template>
    </span>
</template>

<script>

import {upperFirst} from 'lodash-es';
import ModuleLink from './ModuleLink.vue';
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
            return wrongCase ? upperFirst(type) : type;
        },

        isComplexType() {
            return this.subTypes.length > 1;
        },

        apiDocLink() {
            return this.$doc.getTypeUrl(this.primeType);
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
