<template>
    <div>
        <h4>
            <ModuleLink :data="data" tag="div"/>
            <ResourceList v-if="selectedPackage === data || $doc.settings.filter" :data="data"/>

            <ul uk-accordion v-if="data.subPackages && Object.keys(data.subPackages).length" class="uk-list">
                <li>
                    <PackageTree v-for="subPackage in data.subPackages" :data="$doc.resources[subPackage]"/>
                </li>
            </ul>

        </h4>

    </div>
</template>

<script>

    import ModuleLink from './utils/ModuleLink.vue';
    import ResourceList from './ResourceList.vue';

    /**
     * @type {VueComponent}
     */
    const PackageTree = {
        components: {
            ModuleLink,
            ResourceList
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

        computed: {
            selectedPackage() {
                const resource = this.$doc.resources[this.$route.params.resource];
                if (!resource) {
                    debugger;
                }
                return this.$doc.resources[resource.package || resource.resource];
            }
        }

    };

    PackageTree.components.PackageTree = PackageTree;

    export default PackageTree;
</script>

<style>

</style>