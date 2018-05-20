<template>

    <div>

        <Markdown v-if="module.readme" :text="module.readme"/>

        <p>
            {{module.component.description}}
        </p>



        <Slots/>

        <Components/>

        <Mixins/>

        <Props/>

        <Methods/>

        <Emits/>

        <Events/>

        <Triggers/>

        <RepoLink/>

    </div>

</template>

<script>

    import VueComponent from './VueComponent';
    import Component from './Component.vue';

    export default {
        components: {
            ...VueComponent
        },

        extends: Component
    }
</script>