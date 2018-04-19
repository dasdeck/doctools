<template>
    <router-link active-class="uk-active" :tag="tag" :to="`/component/${data.type}.${data.name}`">
        <a>
            {{data.name}}
        </a>
    </router-link>
</template>

<script>

/**
 * wraps link creation to modules
 */
export default {
    props: {
        data: Object,
        tag: {
            type: String,
            default: 'li'
        }
    }
}
</script>

<style>

</style>
