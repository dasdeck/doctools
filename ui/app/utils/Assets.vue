<template>

    <div>
    <div v-for="(asset, name) in assets" :key="name">
        <component v-if="getAsset(asset)" :is="getAsset(asset).type"  :moduleProperty="getAsset(asset)"/>
        <div v-else>asset {{name}} not found</div>
    </div>
    </div>

</template>

<script>

import ModuleComp from './ModuleComp';
import components from '../types';

export default {

    components,

    extends: ModuleComp,

    props: {
        assets: Object
    },

    methods: {
        getAsset(desc) {
            return typeof desc === 'string' ? this.$doc.resources[desc] : desc;
        }
    }
}
</script>

