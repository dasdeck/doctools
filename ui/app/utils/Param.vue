
<template>
    <span>
        {{param.name}}
        <template v-if="param.type"> :
            <Types :type="param.type" seperator="| "/>
        </template>
    </span>
</template>

<script>

import ModuleLink from './ModuleLink.vue';
import Types from './Types.vue';
import ModuleComp from './ModuleComp.js';

export default {

    components: {
        ModuleLink,
        Types
    },

    extends: ModuleComp,

    props: {
        param: Object
    }
}
</script>

