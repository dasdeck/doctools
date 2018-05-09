<template>
    <div>
        <p>
            {{data.module.description}}
        </p>

        <DescList :descs="descs"/>

    </div>
</template>

<script>
    import {size} from 'lodash-es';

    import DescList from '../utils/DescList.vue';
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
            return data.module && (data.module.description || data.module.global && size(data.module.global));
        }

    }
</script>

<style>

</style>
