
<template>
    <span>
        {{param.name}} :
        <Types :type="param.type"/>
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

