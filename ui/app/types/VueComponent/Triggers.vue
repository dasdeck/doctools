<template>
    <div v-if="component.trigger">
        <template v-html="$t('<h2>trigger:</h2>')"/>
        <div v-for="trigger in component.trigger">
            <h3>{{trigger.name}}</h3>
            {{trigger.description}}
        </div>
    </div>
</template>

<script>

    import Base from './Base';

    export default {
        extends: Base
    }

</script>