
<template>
    <span>
        {{param.name}} :
        <Types :type="param.type" :module="module"/>
    </span>
</template>

<script>

import ModuleLink from './ModuleLink.vue';
import Types from './Types.vue';

export default {

    components: {
        ModuleLink,
        Types
    },

    props: {
        param: Object,
        module: Object
    }
}
</script>

