<template>

    <div>
        <component v-for="asset in assets" :is="$doc.resources[asset].type" :data="$doc.resources[asset]"/>
    </div>

</template>

<script>

import ModuleComp from './utils/ModuleComp';
import Markdown from './utils/Markdown.vue';
export default {

    components: {
        Markdown
    },

    extends: ModuleComp,

    props: {
        assetes: Object
    }
}
</script>

