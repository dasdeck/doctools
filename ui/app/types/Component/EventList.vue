<template>
    <div v-if="component.emit">
        <div v-html="$t('<h2>events:</h2>')"></div>
        <PropTable :data="events" :headers="headers"/>
    </div>
</template>

<script>

    import Base from './Base';
    import {mapValues, filter, size} from 'lodash-es';

    export default {
        extends: Base,

        inject: ['$doc'],

        computed: {

            headers() {
                return {name: 'name', description: 'description'};
            },

            hasEvent() {
                return size(this.events);
            },

            events() {

                const events = filter(
                    this.component.emit,
                    event => this.$doc.settings.private || event.access !== 'private'
                );

                return mapValues(events, event => ({
                    name: {
                        template: 'code',
                        html: event.name
                    },
                    description: {
                        template: 'description',
                        text: event.description,
                        trim: true
                    }
                }));
            }

        }
    };

</script>