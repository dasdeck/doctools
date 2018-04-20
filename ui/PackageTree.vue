<template>
    <div>
        <h4>
            <ModuleLink :data="data" tag="div"/>
            <ResourceList v-if="selectedPackage === data || $settings.filter" :data="data"/>

            <ul uk-accordion v-if="data.subPackages && Object.keys(data.subPackages).length" class="uk-list">
                <li>
                    <PackageTree v-for="subPackage in data.subPackages" :resources="resources" :data="resources[subPackage]"/>
                </li>
            </ul>

        </h4>

    </div>
</template>

<script>

import ModuleLink from './ModuleLink.vue';
import ResourceList from './ResourceList.vue';

/**
 * @type {VueComponent}
 */
const PackageTree = {
    components: {
        ModuleLink,
        ResourceList
    },

    inject: ['$settings'],

    props : {
        /**
         * the current package
         */
        data: {
            required: true,
            type: Object
        },

        /**
         * the currently selected pacakges
         */
        resources: {
            type: Object,
            default() {
                return this.data.resources;
            }
        }
    },

    computed: {
        selectedPackage() {
            const resource = this.resources[this.$route.params.resource];
            if(!resource) {
                debugger;
            }
            return this.resources[resource.package];
        }
    }

};

PackageTree.components.PackageTree = PackageTree;

export default PackageTree;
</script>

<style>

</style>