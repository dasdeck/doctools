<template>
    <div v-if="props && Object.keys(props).length">
        <div v-html="$t('<h2>props:</h2>')"/>
        <PropTable :data="props" :annotations="['examples']" :headers="{name: 'name', type: 'type', defaultvalue: 'default', description: 'description'}"/>
    </div>
</template>

<script>

    import Base from './Base';
    import PropTable from '../../utils/PropTable.vue'
    import {mapValues, forEach, orderBy} from 'lodash-es';

    export default {
        extends: Base,

        components: {
            PropTable
        },

        computed: {
            /**
            * the lsit of props with added style information for rendering
            */
            props() {
                const props = this.component.props;

                forEach(
                    props,
                    prop =>
                    (prop._style = {
                        ...prop._style,
                        opacity: prop.optional ? 0.5 : 1,
                        "font-style": prop.inherited ? "italic" : undefined
                    })
                );

                return orderBy(
                    mapValues(props, prop => ({
                    ...prop,
                    type: {template: 'types', type: prop.type},
                    name: {template: 'code', html: prop.name},
                    defaultvalue: {template: 'code', html: prop.defaultvalue}
                    })),
                    ["inherited", "name"],
                    ["desc", "asc"]
                );
            }
        }
    }

</script>