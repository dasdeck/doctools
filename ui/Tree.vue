<template>
    <div>
        <input v-model="filter">

        <h4>
            <router-link :to="`/package/${data.name}`">{{data.name}}</router-link>
        </h4>

        <template v-for="(title, category) in filteredCategories">
            <h4>{{title}}</h4>
            <ul class="uk-nav uk-nav-default">
                <li :style="{opacity: entry.documented.length > 1 ? 1 : 0.2}" v-for="entry in filteredData[category]">
                    <router-link active-class="uk-active" tag="li" :to="`/component/${category}.${entry.name}`">
                        <a>
                            {{entry.name}}
                        </a>
                    </router-link>
                </li>
            </ul>

        </template>
    </div>
</template>

<script>

export default {
    props : {
        data: Object,
        value: Object
    },

    data() {
        return {filter: ''};
    },

    computed: {

        categories() {
            return {'VueComponent': 'Vue', 'UIkitComponent': 'UIkit', 'module': 'Modules'};

        },

        filteredCategories() {
            return  _.pickBy(this.categories, (cat, name) => _.size(this.filteredData[name]));
        },

        filteredData() {

            if(this.filter) {

                const data = {};
                _.forEach(this.categories, (cat, name) => {
                    _.forEach(this.data[name], (entry, key) => {
                        if (entry.name.includes(this.filter)) {
                            data[key] = entry;
                        }
                    })
                });
                return data;
            } else {
                return this.data;
            }
        }

    }


}
</script>

<style>

</style>