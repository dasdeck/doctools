<template>
    <div>
        <h4>
            <ModuleLink :data="data" tag="div"/>

            <ResourceList v-if="selectedPackage === data || $settings.filter" :data="data"/>

            <ul uk-accordion v-if="Object.keys(data.subPackages).length" class="uk-list">
                <li>
                    <PackageTree v-for="subPackage in data.subPackages" :data="$resources[subPackage]"/>
                </li>
            </ul>

        </h4>

    </div>
</template>

<script>

import ModuleLink from './ModuleLink.vue';
import ResourceList from './ResourceList.vue';

const PackageTree = {
    components: {
        ModuleLink,
        ResourceList
    },

    inject: ['$resources', '$settings'],

    props : {
        /**
         * the current package
         */
        data: Object,

        /**
         * the currently selected pacakges
         */
        value: Array
    },

    computed: {
        selectedPackage() {
            const resource = this.$resources[this.$route.params.resource];
            return this.$resources[resource.package];
        }
    }

};

PackageTree.components.PackageTree = PackageTree;

export default PackageTree;
</script>

<style>

</style>