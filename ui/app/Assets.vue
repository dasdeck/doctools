<template>

    <div>
        <component v-for="(asset, name) in assets" :is="$doc.resources[asset].type" :key="name" :data="$doc.resources[asset]"/>
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
        assets: Object
    }
}
</script>

