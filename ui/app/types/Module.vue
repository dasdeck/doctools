<template>
    <div>
        <p>
            {{data.description}}
        </p>

        <hr>

        <template v-for="desc in data.module.documented" v-if="hasKind(desc.kind)">
            <component :is="desc.template || desc.kind" :data="desc" :module="data"/>
            <hr>
        </template>

        <!-- <Code language="javascript">{{data.script}}</Code> -->
    </div>
</template>

<script>
    import PropTable from '../utils/PropTable.vue';
    import Function from '../utils/Function.vue';
    import Constant from '../utils/Constant.vue';
    import Typedef from '../utils/Typedef.vue';
    import _ from 'lodash';

    /**
     * View to render module files
     *
     */
    export default {
        components: {
            PropTable,
            Function,
            Constant,
            Member: Constant,
            Typedef
        },
        props: {
            data: Object
        },
        methods: {
            hasKind(kind) {
                return this.$options.components[_.upperFirst(kind)];
            }
        }
    }
</script>

<style>

</style>
