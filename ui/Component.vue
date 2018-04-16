<template>
    <div>
        <h1>{{data.name}}</h1>

        {{data.description}}

        <hr>

        <template v-if="data.props">
            <h2>props:</h2>

            <table class="uk-table uk-table-striped">

                <thead>
                    <tr>
                        <th>name</th>
                        <th>type</th>
                        <th>description</th>
                    </tr>
                </thead>

                <tbody>
                    <template v-for="prop in data.props">
                        <tr :style="!prop.required ? {opacity: 0.5} : {}">

                            <td >{{prop.name}}</td>
                            <td >{{prop.type.names.join('|')}}</td>
                            <td >{{prop.description}}</td>
                        </tr>
                        <tr v-for="example in prop.examples">
                            <td >example:</td>
                            <td colspan="2" ><pre>{{example}}</pre></td>
                        </tr>
                    </template>
                </tbody>

            </table>
        <hr>
        </template>


        <template v-if="data.slot">
            <h2>slots:</h2>
            <div v-for="slot in data.slot">
                <h4>{{slot.name}}</h4>
                {{slot.description}}
            </div>
                <hr>
        </template>

        <template v-if="methods.length">
            <h2>methods:</h2>


            <ul class="uk-list">

            <li v-for="method in methods">

            <h3>{{method.el.name}}</h3>
            <pre>{{method.signature}}</pre>
            {{method.el.description}}

            <PropTable v-for="(table, name) in method.tables" :name="name" :data="table.slice(1)" :headers="['name', 'type', 'description']" />

            </li>
            </ul>
                <hr>

        </template>

        <template v-if="data.computed">
            <h2>computed:</h2>
            <li v-for="computed in data.computed">
                    <h3>{{computed.name}}{{computed.type && ' : ' + computed.type.names.join('|')}}</h3>
                    {{computed.description}}

                </li>
        </template>

        <template v-if="data.events">
            <h2>events:</h2>

            <ul class="uk-list">
                <li v-for="event in data.events">
                    <h3>{{event.name}}</h3>
                    {{event.description}}
                </li>
            </ul>
        </template>

        <template v-if="data.emit">
            <h2>emits:</h2>

            <ul class="uk-list">
                <li v-for="event in data.emit">
                    <h3>{{event.name}}</h3>
                    {{event.description}}
                </li>
            </ul>
        </template>

        <template v-if="data.trigger">
            <h2>trigger:</h2>

            <ul class="uk-list">
                <li v-for="trigger in data.trigger">
                    <h3>{{trigger.name}}</h3>
                    {{trigger.description}}
                </li>

            </ul>
        </template>

    </div>
</template>

<script>

import PropTable from './PropTable.vue';
import _ from 'lodash';
export default {
    components: {
        PropTable
    },
    props: {
        data: Object,
        private: Boolean
    },

    computed: {
        methods() {

            return _.filter(this.data.methods, method => this.private || method.el.access !== 'private');
        }
    }
}
</script>

<style>

</style>
