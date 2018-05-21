<template>
    <div v-if="component.events">

        <div v-html="$t('<h2>triggers:</h2>')"></div>
        <div v-for="event in component.events">
            <h3>{{event.name}}</h3>
            <Description :text="event.description"/>
        </div>

    </div>
</template>

<script>

    import Base from './Base';

    export default {
        extends: Base
    }

</script>