<template>
    <div v-if="component.trigger">
        <div v-html="$t('<h2>global events:</h2>')"></div>
        <div v-for="trigger in component.trigger">
            <Function :data="trigger"/>
        </div>
    </div>
</template>

<script>

    import Base from './Base';

    export default {
        extends: Base
    };

</script>