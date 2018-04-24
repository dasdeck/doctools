<template>
    <div>
        <h1>{{data.name}}</h1>

        {{data.description}}

        <hr>

        <template v-if="data.slot">
            <h2>slots:</h2>
            <div v-for="slot in data.slot">
                <h4>{{slot.name}}</h4>
                {{slot.description}}
            </div>
            <hr>
        </template>

        <template v-if="data.mixins && data.mixins.length">
            <h2>mixins:</h2>
            <template v-for="(mixin, index) in data.mixins">
                <ModuleLink v-if="mixin.linked"  tag="span" :data="$doc.resources[mixin.name]"/>
                <span v-else>{{mixin.name || '?'}}</span>
                <span v-if="index + 1 < data.mixins.length">, </span>
            </template>
            <hr>
        </template>

        <template v-if="data.props && Object.keys(data.props).length">
            <h2>props:</h2>
            <PropTable :data="props" :annotations="['examples']" :headers="{name: 'name', type: 'type', defaultvalue: 'default', description: 'description'}" />
        </template>

        <template v-if="methods.length">
            <h2>methods:</h2>
            <ul class="uk-list">
            <li v-for="method in methods">
                <Function :data="method"/>
            <!-- <h3>{{method.name}}</h3>
            <code>{{method.signature}}</code>
            <p>
                {{method.description}}
            </p>
            <PropTable v-for="(table, name) in method.tables" :name="name" :data="table.slice(1)" :headers="['name', 'type', 'description']" /> -->
            <hr>
            </li>
            </ul>
            <hr>
        </template>

        <template v-if="data.computed">
            <h2>computed:</h2>
            <li v-for="computed in data.computed">
                <h3>{{computed.name}}{{computed.type && (' : ' + computed.type.names.join('|'))}}</h3>
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
import ModuleLink from '../utils/ModuleLink.vue';
import PropTable from '../utils/PropTable.vue';
import Function from '../utils/Function.vue';
import _ from 'lodash';
export default {

    components: {
        ModuleLink,
        PropTable,
        Function
    },

    props: {
        data: Object
    },

    inject: ['$doc'],

    computed: {
        /**
         * the filtered list of methods
         */
        methods() {
            return _.filter(this.data.methods, method => this.$doc.settings.private || method.access !== 'private');
        },

        /**
         * the lsit of props with added style information for rendering
         */
        props() {

            const props = this.data.props;

            _.forEach(props, prop => prop._style = {...prop._style, opacity: prop.optional ? 0.5 : 1, 'font-style':  prop.inherited ? 'italic' : undefined});

            return _.orderBy(_.mapValues(props, prop => ({...prop, type: prop.type && prop.type.names.join('|')})), ['inherited', 'name'], ['desc', 'asc']);
        }
    }
}
</script>