<template>
    <div>
        <h4 v-if="name">{{ name }}</h4>
        <table class="uk-table uk-table-divider">

            <thead v-if="headerToUse">
                <tr>
                    <th v-for="header in filteredHeaders">{{ header }}</th>
                </tr>
            </thead>

            <tbody>
                <template v-for="row in filteredData">
                    <tr :style="row._style">
                        <td v-for="(header, col) in filteredHeaders">
                            <component v-if="row[col] && row[col].template" :is="row[col].template" v-bind="omit(row[col], 'template')">{{ row[col].html }}</component>
                            <span v-else>{{ row[col] }}</span>
                        </td>
                    </tr>

                    <template v-for="annotation in annotations" v-if="row[annotation]">
                        <tr v-for="content in row[annotation]">
                            <td :colspan="numCols">
                                ↳<code>{{ content }}</code>
                            </td>
                        </tr>
                    </template>

                </template>

            </tbody>
        </table>

    </div>
</template>

<script>
    import {forEach, some, isPlainObject, size, filter, isUndefined, omit} from 'lodash-es';
    import Types from './Types.vue';
    import Description from './Description.vue';

    /**
     * utility view to render property lists
     * the table width will be determined by the header, so you need to provide one,
     */
    export default {

        components: {
            Types,
            Description
        },

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
                forEach(this.headerToUse, (title, index) => {
                    if (some(this.filteredData, row => {
                        const val = row[index];
                        if (isPlainObject(val)) {
                            return size(filter(val, v => !isUndefined(v))) > 1;
                        } else {
                            return val;
                        }
                    })) {
                        res[index] = title;
                    }
                });
                return this.headerToUse ? res : this.data[0];
            },

            numCols() {
                return size(this.filteredHeaders);
            },

            filteredData() {
                return this.headers === true ? this.data.slice(1) : this.data;
            }
        },

        methods: {
            omit
        }
    };
</script>

<style>

</style>
