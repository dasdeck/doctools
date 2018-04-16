<template>
<div>

    <h3>{{name}}</h3>
    <table class="uk-table uk-table-striped">

                <thead v-if="filteredHeaders">
                    <tr>
                        <th v-for="header in filteredHeaders">{{header}}</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="row in filteredData" :style="row.optional ? {opacity: 0.5} : {}">
                        <td v-for="(header, col) in filteredHeaders" >{{row[col]}}</td>
                    </tr>
                </tbody>
            </table>

            </div>
</template>

<script>
export default {
    props: {
        name: String,
        data: [Array, Object],
        headers: [Array, Boolean]
    },
    computed: {
        filteredHeaders() {
            return this.headers === true ? this.data[0] : this.headers;
        },
        filteredData() {
            return this.headers === true ? this.data.slice(1) : this.data;

        }
    },
}
</script>

<style>

</style>
