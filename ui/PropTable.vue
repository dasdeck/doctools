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
import _ from 'lodash';

export default {
    props: {
        name: String,
        data: [Array, Object],
        headers: [Array, Boolean, Object]
    },
    computed: {
        filteredHeaders() {
            const res = {};
            const headerToUse = this.headers === true ? this.data[0] : this.headers;
            _.forEach(headerToUse, (title, index) => {
                if (_.some(this.data, row => {
                    return row[index];
                })) {
                    res[index] = title;
                }
            });
            return res;
        },
        filteredData() {
            return this.headers === true ? this.data.slice(1) : this.data;

        }
    },
}
</script>

<style>

</style>
