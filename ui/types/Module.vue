<template>
    <div>
        <h1>{{data.name}}</h1>

        <p>
            {{data.description}}
        </p>

        <hr>

        <template v-for="desc in data.documented" v-if="hasKind(desc.kind)">
            <component :is="desc.kind" :data="desc"/>
            <hr>
        </template>



    </div>
</template>

<script>
import PropTable from '../utils/PropTable.vue';
import Function from '../utils/Function.vue';
import Constant from '../utils/Constant.vue';
import _ from 'lodash';

/**
 * View to render module files
 *
 */
export default {
    components: {
        PropTable,
        Function,
        Constant
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
