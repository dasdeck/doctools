<template>
    <div>
        <h4>

            <router-link :to="`/${data.resource}`">
                {{data.name}}
            </router-link>

            <ResourceList v-if="selectedPackage === data || $doc.settings.filter" :data="data"/>

            <ul uk-accordion v-if="data.packages && Object.keys(data.packages).length" class="uk-list">
                <li>
                    <PackageTree v-for="subPackage in data.packages" :data="$doc.resources[subPackage]"/>
                </li>
            </ul>

        </h4>

    </div>
</template>

<script>

    import ResourceList from './ResourceList.vue';

    /**
     * @type {VueComponent}
     */
    const PackageTree = {

        components: {
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
                return this.$doc.resources[resource.type === 'package' ? resource.resource : resource.package];
            }
        }

    };

    PackageTree.components.PackageTree = PackageTree;

    export default PackageTree;
</script>

<style>

</style>