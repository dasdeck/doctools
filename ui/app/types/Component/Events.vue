<template>
    <div v-if="component.emit">
        <div v-html="$t('<h2>events:</h2>')"></div>
        <div v-for="event in component.emit">
            <Function :data="event"/>
        </div>
    </div>
</template>

<script>

    import Base from './Base';

    export default {
        extends: Base
    };

</script>