<template>
    <router-link v-if="!isUndefined(resource) && $doc.resources[resource]" :to="this.$doc.getUrl(resource)">
        {{prefix}}{{name || $doc.resources[resource].name || fallback}}
    </router-link>
    <span v-else>{{prefix}}{{(name || fallback)}}</span>
</template>

<script>

import {isUndefined} from 'lodash-es';

export default {
    props: {
        resource: String,
        name: String,
        prefix: String,
        fallback: String
    },

    inject: ['$doc'],

    methods: {
        isUndefined
    }
}
</script>
