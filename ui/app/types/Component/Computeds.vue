<template>
    <div v-if="component.computed">
        <div v-html="$t('<h2>computed:</h2>')"/>
        <div v-for="computed in component.computed">
            <h3>{{computed.name}}</h3>
            <h4 class="inherited" v-if="computed.inherited"> ↳ <ModuleLink :resource="computed.inherited"/>.{{computed.name}}</h4>
            <Types :type="computed.type"/>
            <p>
                {{computed.description}}
            </p>
        </div>
    </div>
</template>

<script>

    import Base from './Base';

    export default {
        extends: Base
    }

</script>