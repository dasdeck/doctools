<template>
    <div>
        <p>
            {{data.module.description}}
        </p>

        <DescList :descs="descs"/>

    </div>
</template>

<script>
    import DescList from '../utils/DescList.vue';
    import _ from 'lodash';
    import Base from './Base';

    /**
     * View to render module files
     *
     */
    export default {
        extends: Base,

        components: {
            DescList,

        },
        computed: {
            descs() {
                return this.data.module.global;
            }
        },

        hasContent(data) {
            return data.module && (data.module.description || data.module.global && _.size(data.module.global));
        }

    }
</script>

<style>

</style>
