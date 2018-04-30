<template>
    <router-link v-if="resource && $doc.resources[resource]" :to="`${resource}`">
        {{prefix}}{{name || $doc.resources[resource].name || fallback}}
    </router-link>
    <span v-else>{{prefix}}{{(name || fallback)}}</span>
</template>

<script>
export default {
    props: {
        resource: String,
        name: String,
        prefix: String,
        fallback: String
    },

    inject: ['$doc']
}
</script>
