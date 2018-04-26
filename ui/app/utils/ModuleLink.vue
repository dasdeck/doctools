<template>

    <router-link v-if="resource && $doc.resources[resource]" :to="`/${resource}`">
        {{name || $doc.resources[resource].name}}
    </router-link>
    <span v-else>{{name || '?'}}</span>
</template>

<script>
export default {
    props: {
        resource: String,
        name: String
    },

    inject: ['$doc']
}
</script>
