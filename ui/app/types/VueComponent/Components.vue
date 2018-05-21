<template>
    <div v-if="component.components">
        <div v-html="$t('<h2>components:</h2>')"/>
        <div v-for="comp in component.components">
            <ModuleLink :resource="comp.resource"/>
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