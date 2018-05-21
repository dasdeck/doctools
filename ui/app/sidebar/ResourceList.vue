<template>
    <div>
        <template v-for="(title, category) in filteredCategories">
            <h4>{{title}}</h4>
            <ul class="uk-nav uk-nav-default">
                <li v-for="(entry) in types[category]" >
                    <ModuleLink :resource="entry"/>
                </li>
            </ul>
        </template>
    </div>
</template>

<script>

    import ModuleLink from '../utils/ModuleLink.vue';
    import {pickBy, reduce, size} from 'lodash-es';

    export default {

        components: {
            ModuleLink
        },

        inject: ['$doc'],

        props: {
            /**
             * the current package
             */
            data: Object

        },

        computed: {

            filter() {
                return this.$doc.settings.filter;
            },

            categories() {
                return {'VueComponent': 'Vue', 'UIkitComponent': 'UIkit', 'module': 'Modules'};
            },

            filteredCategories() {
                return pickBy(this.categories, (cat, name) => size(this.types[name]));
            },

            types() {

                const types = reduce(this.data.resources, (acc, val, key) => {

                    const entry = this.$doc.resources[val];

                    if (!this.filter || entry.name.includes(this.filter)) {

                        if (!acc[entry.type]) {
                            acc[entry.type] = {};
                        }
                        acc[entry.type][val] = val;

                    }
                    return acc;

                }, {});

                return types;
            },


        }

    };
</script>

<style>

</style>