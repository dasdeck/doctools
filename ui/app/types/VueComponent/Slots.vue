<template>
    <div v-if="component.slot">
        <div v-html="$t('<h2>slots:</h2>')"/>
        <div v-for="slot in component.slot">
            <h4>{{slot.name}}</h4>
            <Description :text="slot.description"/>
        </div>
        <hr>
    </div>
</template>

<script>

    import Base from './Base';

    export default {

        extends: Base
    }

</script>