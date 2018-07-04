<template>

    <div>

        <Markdown v-if="module.readme" :text="module.readme"/>

        <Description :text="module.component.description"/>

        <Slots/>

        <Props/>

        <Methods/>

        <Computeds/>

        <Events/>

        <GlobalEvents/>

        <Triggers/>

        <Components/>

        <Mixins/>

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
    };
</script>