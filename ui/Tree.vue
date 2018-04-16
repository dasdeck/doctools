<template>
    <div>
        <input v-model="filter">

        <ul class="uk-list">

        </ul>
        <template v-for="(title, category) in categories">
        <h4>{{title}}</h4>
        <ul class="uk-list">
            <li class="uk-active" v-if="!filter || ~entry.name.indexOf(filter)" v-for="entry in data[category]" @click="$emit('show', entry)">
                <a :href="`#${category}.${entry.name}`">{{entry.name}}</a>
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
            return {component: 'Components', module: 'Modules'};
        }

    }
}
</script>

<style>

</style>
