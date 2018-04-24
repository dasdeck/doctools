<template>
    <div>
        <template v-for="(title, category) in filteredCategories">
            <h4>{{title}}</h4>
            <ul class="uk-nav uk-nav-default">
                <li v-for="(entry) in filteredData[category]" :style="{opacity: $doc.resources[entry].documented.length > 1 ? 1 : 0.2}">
                    <router-link :to="`/${$doc.resources[entry].resource}`">
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
                return _.pickBy(this.categories, (cat, name) => _.size(this.filteredData[name]));
            },

            filteredData() {

                if (this.filter) {

                    const data = {};

                    _.forEach(this.categories, (cat, name) => {
                        _.forEach(this.data[name], (resource, key) => {
                            const entry = this.$docData.resources[resource];
                            if (entry.name.includes(this.filter)) {
                                data[name] = data[name] || {};
                                data[name][key] = resource;
                            }
                        })
                    });
                    return data;
                } else {
                    return this.data;
                }
            }

        }

    };
</script>

<style>

</style>