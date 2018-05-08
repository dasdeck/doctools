<template>
    <div>
        <div v-for="desc in descs" v-if="hasKind(desc.kind) && !desc.undocumented">
            <component :is="desc.template || desc.kind" :data="desc" headline="h2"/>
            <DescList v-if="desc.children" :descs="desc.children"/>
            <hr>
        </div>
    </div>
</template>

<script>

import _ from 'lodash';

import Function from './Function.vue';
import Constant from './Constant.vue';
import Typedef from './Typedef.vue';
    import ModuleComp from './ModuleComp.js';

const DescList = {
    components:{
        Function,
        Constant,
        Member: Constant,
        Typedef
    },

extends: ModuleComp,

    props: {
        descs: Object
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
