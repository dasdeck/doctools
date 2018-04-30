<template>
    <div>
        <div v-for="desc in descs" v-if="hasKind(desc.kind)">
            <component :is="desc.template || desc.kind" :data="desc" :module="module" headline="h2"/>
            <DescList v-if="desc.children" :descs="desc.children"/>
            <hr>
        </div>
    </div>
</template>

<script>

import Function from './Function.vue';
import Constant from './Constant.vue';
import Typedef from './Typedef.vue';

const DescList = {
    components:{
        Function,
        Constant,
        Member: Constant,
        Typedef
    },

    inject: ['$doc'],


    props: {
        descs: Array,
        module: {
                type: Object,
                default() {
                    return this.$doc.selectedModule;
                }
            }
    },

    methods: {
        hasKind(kind) {
            return this.$options.components[_.upperFirst(kind)];
        }
    }
}

DescList.components.DescList = DescList;

export default DescList;
</script>

<style>

</style>
