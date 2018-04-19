<template>
<div>
    <h3 v-if="name">{{name}}</h3>
    <table class="uk-table uk-table-striped">

        <thead v-if="filteredHeaders">
            <tr>
                <th v-for="header in filteredHeaders">{{header}}</th>
            </tr>
        </thead>

        <tbody>
            <template v-for="row in filteredData">
                <tr :style="row._style">
                    <td v-for="(header, col) in filteredHeaders" >{{row[col]}}</td>
                </tr>

                <template v-for="annotation in annotations">
                    <tr v-if="row[annotation]" v-for="content in row[annotation]">
                        <td :colspan="numCols">
                            ↳<code>{{content}}</code>
                        </td>
                    </tr>
                </template>

            </template>

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
        headers: [Array, Boolean, Object],
        annotations: [Array]
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
        numCols() {
            return _.size(this.filteredHeaders);
        },
        filteredData() {
            return this.headers === true ? this.data.slice(1) : this.data;

        }
    },
}
</script>

<style>

</style>
