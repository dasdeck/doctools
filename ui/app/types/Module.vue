<template>
    <div>
        <p>
            {{module.module.description}}
        </p>

        <DescList :descs="descs"/>

        <a v-if="repoLink" :href="repoLink" v-html="$t('edit in repo')"></a>

    </div>
</template>

<script>
    import {size} from 'lodash-es';

    import DescList from '../utils/DescList.vue';
    import ModuleComp from '../utils/ModuleComp';

    /**
     * View to render module files
     *
     */
    export default {
        extends: ModuleComp,

        components: {
            DescList,

        },
        computed: {
            descs() {
                return this.module.module.global;
            }
        },

        hasContent(data) {
            return data.module && (data.module.description || data.module.global && size(data.module.global));
        }

    }
</script>

<style>

</style>
