<template>
    <div>
        <h1>{{data.name}}</h1>

        {{data.module.description}}

        <hr>

        <template v-if="component.slot">
            <h2>slots:</h2>
            <div v-for="slot in data.slot">
                <h4>{{slot.name}}</h4>
                {{slot.description}}
            </div>
            <hr>
        </template>

        <template v-if="component.mixins && component.mixins.length">
            <h2>mixins:</h2>
            <template v-for="(mixin, index) in component.mixins">
                <span v-if="mixin.linked">
                    <router-link :to="`/${$doc.resources[mixin.name].resource}`">
                        {{$doc.resources[mixin.name].name}}
                    </router-link>
                </span>
                <span v-else>{{mixin.name || '?'}}</span>
                <span v-if="index + 1 < component.mixins.length">, </span>
            </template>
            <hr>
        </template>

        <template v-if="component.props && Object.keys(component.props).length">
            <h2>props:</h2>
            <PropTable :data="props" :annotations="['examples']" :headers="{name: 'name', type: 'type', defaultvalue: 'default', description: 'description'}"/>
        </template>

        <template v-if="methods.length">
            <h2>methods:</h2>
            <ul class="uk-list">
                <li v-for="method in methods">
                    <Function :data="method"/>
                    <hr>
                </li>
            </ul>
            <hr>
        </template>

        <template v-if="component.computed">
            <h2>computed:</h2>
            <li v-for="computed in component.computed">
                <h3>{{computed.name}}{{computed.type && (' : ' + computed.type.names.join('|'))}}</h3>
                {{computed.description}}
            </li>
        </template>

        <template v-if="component.events">
            <h2>events:</h2>

            <ul class="uk-list">
                <li v-for="event in component.events">
                    <h3>{{event.name}}</h3>
                    {{event.description}}
                </li>
            </ul>
        </template>

        <template v-if="component.emit">
            <h2>emits:</h2>

            <ul class="uk-list">
                <li v-for="event in component.emit">
                    <h3>{{event.name}}</h3>
                    {{event.description}}
                </li>
            </ul>
        </template>

        <template v-if="component.trigger">
            <h2>trigger:</h2>

            <ul class="uk-list">
                <li v-for="trigger in component.trigger">
                    <h3>{{trigger.name}}</h3>
                    {{trigger.description}}
                </li>

            </ul>
        </template>
    </div>
</template>

<script>

    import PropTable from '../utils/PropTable.vue';
    import Function from '../utils/Function.vue';
    import _ from 'lodash';

    export default {

        components: {
            PropTable,
            Function
        },

        props: {
            data: Object
        },

        inject: ['$doc'],

        computed: {

            component() {
                return this.data.component;
            },

            /**
             * the filtered list of methods
             */
            methods() {
                return _.filter(this.component.methods, method => this.$doc.settings.private || method.access !== 'private');
            },

            /**
             * the lsit of props with added style information for rendering
             */
            props() {

                const props = this.component.props;

                _.forEach(props, prop => prop._style = {
                    ...prop._style,
                    opacity: prop.optional ? 0.5 : 1,
                    'font-style': prop.inherited ? 'italic' : undefined
                });

                return _.orderBy(_.mapValues(props, prop => ({
                    ...prop,
                    type: prop.type && prop.type.names.join('|')
                })), ['inherited', 'name'], ['desc', 'asc']);
            }
        }
    }
</script>