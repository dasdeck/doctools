<template>
    <div>
        <template v-for="(title, category) in filteredCategories">
            <h4>{{title}}</h4>
            <ul class="uk-nav uk-nav-default">
                <li v-for="(entry) in types[category]" :style="{opacity: $doc.resources[entry].module.documented.length > 1 ? 1 : 0.2}">
                    <router-link :to="`/${entry}`">
                        {{$doc.resources[entry].name}}
                    </router-link>
                </li>
            </ul>
        </template>
    </div>
</template>

<script>

    export default {

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
                return _.pickBy(this.categories, (cat, name) => _.size(this.types[name]));
            },

            types() {

                const types = _.reduce(this.data.resources, (acc, val, key) => {

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