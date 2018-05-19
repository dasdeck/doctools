<template>
    <div>
        <h4>

            <ModuleLink :resource="data.resource"/>

            <ResourceList v-if="$doc.selectedPackage === data || $doc.settings.filter" :data="data"/>

            <ul uk-accordion v-if="data.packages && Object.keys(data.packages).length" class="uk-list">
                <li>
                    <PackageTree :key="subPackage.resource" v-for="subPackage in data.packages" :data="$doc.resources[subPackage]"/>
                </li>
            </ul>

        </h4>

    </div>
</template>

<script>

    import ResourceList from './ResourceList.vue';
    import ModuleLink from '../utils/ModuleLink.vue';

    /**
     * @type {VueComponent}
     */
    const PackageTree = {

        components: {
            ResourceList,
            ModuleLink
        },

        inject: ['$doc'],

        props: {
            /**
             * the current package
             */
            data: {
                required: true,
                type: Object
            }

        },



    };

    PackageTree.components.PackageTree = PackageTree;

    export default PackageTree;
</script>

<style>

</style>