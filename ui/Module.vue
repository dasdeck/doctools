<template>
    <div>
        <h1>{{data.name}}</h1>

        {{data.description}}

        <hr>

        <template v-if="data.function">
            <li v-for="func in data.function">
            <h2>{{func.name}}</h2>
            {{func.description}}
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
