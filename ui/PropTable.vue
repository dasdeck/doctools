<template>
    <div>
        <h3 v-if="name">{{name}}</h3>
        <table class="uk-table uk-table-striped">

            <thead v-if="headerToUse">
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

/**
 * utility view to render property lists
 * the table width will be determined by the header, so you need to provide one,
 */
export default {
    props: {
        /**
         * header text, will be skipped if empty
         */
        name: String,
        /**
         * the actual table data structure
         */
        data: [Array, Object],
        /**
         * define table headers. if set to true, the first line of the data is used
         */
        headers: [Array, Boolean, Object],
        /**
         * table column to use for annotations, e.g. the key in a row to use
         */
        annotations: [Array]
    },
    computed: {
        /**
         * the header to use or undefined
         */
        headerToUse() {
            return this.headers === true ? this.data[0] : this.headers;

        },

        /**
         * the filtered headers or the first row of the data if not headers a present
         * @type {Array|Object}
         */
        filteredHeaders() {
            const res = {};
            _.forEach(this.headerToUse, (title, index) => {
                if (_.some(this.data, row => {
                    return row[index];
                })) {
                    res[index] = title;
                }
            });
            return this.headerToUse ? res : this.data[0];
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
