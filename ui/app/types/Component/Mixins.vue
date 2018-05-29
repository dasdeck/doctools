<template>
    <div v-if="component.mixins">

        <div v-html="$t('<h2>mixins:</h2>')"></div>
        <template v-for="(mixin, index) in component.mixins">
            <div :key="index">
                <ModuleLink v-if="mixin.resource" :resource="mixin.resource"/>
                <span v-else>{{ mixin.name || '?' }}</span>
                <span v-if="index + 1 < component.mixins.length">, </span>
            </div>
        </template>
        <hr>
    </div>
</template>

<script>

    import Base from './Base';

    export default {

        extends: Base

    };

</script>