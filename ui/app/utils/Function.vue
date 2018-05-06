<template>
    <div :class="data.inherited ? 'inherited' : ''">
        <component :is="headline" :id="data.simpleName">
            {{data.simpleName}}:
        </component>
        <a v-if="data.reference" :href="`#${data.reference}`" uk-scroll>
            {{data.description}}
        </a>
        <template v-else>
            <code v-if="data.memberof === 'module.exports'">import { {{data.simpleName}} } from '{{module.fileInPackage}}'</code>
            <p>{{data.description}}</p>

            <h4 class="signature">{{data.simpleName}}(
                <template v-for="(param, index) in data.params" >
                    <Param :param="param" />
                    <span v-if="index < data.params.length - 1">, </span>
                </template>
                )<span v-if="data.returns">
                    : <Types v-for="(ret, i) in data.returns" :key="i" :type="ret.type"/></span></h4>

            <PropTable :key="name" v-for="(table, name) in data.tables" :name="name" :data="table" :headers="true"/>
            <template v-if="data.returns && data.returns.length">
                <h4>returns:</h4>
                <template v-for="(ret, i) in data.returns">
                    <Types :type="ret.type" :key="i"/>
                    <!-- <h4><code>{{ret.type.names.join('|')}}</code></h4> -->
                    <p>{{ret.description}}</p>
                </template>
            </template>
        </template>
    </div>
</template>

<script>
    import PropTable from './PropTable.vue';
    import ModuleLink from './ModuleLink.vue';
    import Param from './Param.vue';
    import Types from './Types.vue';
    import ModuleComp from './ModuleComp.js';

    /**
     * renders a function
     * can also be used to render objects with a function like signatures like `event` and `trigger`
     *
     */
    export default {
        components: {
            PropTable,
            ModuleLink,
            Param,
            Types
        },

        extends: ModuleComp,

        props: {
            headline: {
                type: String,
                default: "h3"
            },
            data: Object
        }
    }
</script>
