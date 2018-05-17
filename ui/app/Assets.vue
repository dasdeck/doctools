<template>

    <div>
    <div v-for="(asset, name) in assets" :key="name">
        <component  v-if="$doc.resources[asset]" :is="$doc.resources[asset].type"  :data="$doc.resources[asset]"/>
        <div v-else>asset {{asset}} found</div>
    </div>
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

