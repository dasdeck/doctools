<template>
    <div v-if="props && Object.keys(props).length">
        <div v-html="$t('<h2>props:</h2>')"></div>
        <PropTable :data="props" :annotations="['examples']" :headers="headers"/>
    </div>
</template>

<script>

    import Base from './Base';
    import {mapValues, forEach, orderBy, filter} from 'lodash-es';

    export default {
        extends: Base,

        inject: ['$doc'],

        computed: {

            headers() {
                return {name: 'name', type: 'type', defaultvalue: 'default', description: 'description'};
            },
            /**
            * the lsit of props with added style information for rendering
            */
            props() {

                const props = filter(
                    this.component.props,
                    prop => this.$doc.settings.private || prop.access !== 'private'
                );

                forEach(
                    props,
                    prop =>
                    (prop._style = {
                        ...prop._style,
                        opacity: prop.optional ? 0.5 : 1,
                        'font-style': prop.inherited ? 'italic' : undefined
                    })
                );

                return orderBy(
                    mapValues(props, prop => ({
                        ...prop,
                        type: {template: 'Types', type: prop.type},
                        name: {template: 'code', html: prop.name},
                        defaultvalue: {template: 'code', html: prop.defaultvalue},
                        description: {template: 'Description', text: prop.description, trim: true}
                    })),
                    ['inherited', 'name'],
                    ['desc', 'asc']
                );
            }
        }
    };

</script>