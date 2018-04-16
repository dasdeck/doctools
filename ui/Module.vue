<template>
    <div>
        <h1>{{data.name}}</h1>

        {{data.description}}

        <hr>

        <template v-if="data.functions">
            <li v-for="func in data.functions">
            <h2>{{func.el.name}}</h2>
            {{func.el.description}}
            <h4><code>{{func.signature}}</code></h4>
            <PropTable v-for="(table, name) in func.tables" :name="name" :data="table" :headers="true"/>
            <hr>
            </li>
            </ul>
        </template>

    </div>
</template>

<script>
import PropTable from './PropTable.vue';

export default {
    components: {
        PropTable
    },
    props: {
        data: Object
    }
}
</script>

<style>

</style>
