<template>
    <div>
        <div v-for="desc in descs" v-if="hasKind(desc.kind) && !desc.undocumented">
            <a id="desc.longname"></a>
            <component :is="desc.template || desc.kind" :data="desc"/>
            <DescList v-if="desc.children" :descs="desc.children"/>
            <hr>
        </div>
    </div>
</template>

<script>

    import {upperFirst} from 'lodash-es';

    import Function from './Function.vue';
    import Constant from './Constant.vue';
    import Typedef from './Typedef.vue';
    import ModuleComp from './ModuleComp.js';

    const DescList = {
        components: {
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
                return this.$options.components[upperFirst(kind)];
            }
        }
    };

    DescList.components.DescList = DescList;

    export default DescList;
</script>

<style>

</style>
