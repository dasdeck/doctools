<template>
    <div>
        <Description :text="module.module.description"/>

        <DescList :descs="descs"/>

    </div>
</template>

<script>
    import {size} from 'lodash-es';

    import utils from '../utils';
    import ModuleComp from '../utils/ModuleComp';

    /**
     * View to render module files
     *
     */
    export default {

        components: utils,

        extends: ModuleComp,

        computed: {
            descs() {
                return this.module.module.global;
            }
        },

        hasContent(data) {
            return data.module && (data.module.description || data.module.global && size(data.module.global));
        }

    };
</script>

<style>

</style>
