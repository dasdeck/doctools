<template>
    <div v-if="component.emit">
        <div v-html="$t('<h2>events:</h2>')"></div>
        <div v-for="event in events">
            <Function :data="event"/>
        </div>
    </div>
</template>

<script>

    import Base from './Base';
    import {filter} from 'lodash-es';

    export default {
        extends: Base,

        inject: ['$doc'],

        computed: {
            events() {
                return filter(
                    this.component.emit,
                    event => this.$doc.settings.private || event.access !== 'private'
                );
            }
        }
    };

</script>