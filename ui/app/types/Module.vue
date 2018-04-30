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

    /**
     * View to render module files
     *
     */
    export default {
        components: {
            DescList,

        },
        props: {
            data: Object
        },
        computed: {
            descs() {
                return this.data.module.global;
            }
        }

    }
</script>

<style>

</style>
