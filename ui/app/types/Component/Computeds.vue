<template>
    <div v-if="component.computed">
        <div v-html="$t('<h2>computed:</h2>')"></div>
        <div v-for="computed in component.computed">
            <h3>{{ computed.name }}</h3>
            <h4 v-if="computed.inherited" class="inherited"> ↳ <ModuleLink :resource="computed.inherited"/>.{{ computed.name }}</h4>
            <Types :type="computed.type"/>
            <Description :text="computed.description"/>
        </div>
    </div>
</template>

<script>

    import Base from './Base';

    export default {
        extends: Base
    };

</script>