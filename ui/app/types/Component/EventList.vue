<template>
    <div v-if="component.emit">
        <div v-html="$t('<h2>events:</h2>')"></div>
        <PropTable :data="events" :headers="headers"/>
    </div>
</template>

<script>

    import Base from './Base';
    import {mapValues} from 'lodash-es';

    export default {
        extends: Base,

        computed: {

            headers() {
                return {name: 'name', description: 'description'};
            },

            events() {
                return mapValues(this.component.emit, event => ({
                    name: {
                        template: 'code',
                        html: event.name
                    },
                    description: {
                        template: 'description',
                        text: event.description,
                        trim: true
                    }
                }))
            }

        }
    }

</script>