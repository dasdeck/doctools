<template>
    <div :class="data.inherited ? 'inherited' : ''">

        <component :is="headline" :id="data.simpleName">
            {{ data.simpleName }}:
        </component>

        <a v-if="data.reference" :href="`#${data.reference}`" uk-scroll>
            <Description :text="data.description"/>
        </a>

        <template v-else>

            <code v-if="data.memberof === 'module.exports'">import { {{ data.simpleName }} } from '{{ module.fileInPackage }}'</code>

            <Description :text="data.description"/>

            <h4 class="signature">{{ data.simpleName }}(
                <template v-for="(param, index) in data.params" >
                    <Param :param="param"></Param>
                    <span v-if="index < data.params.length - 1">, </span>
                </template>
                )<span v-if="data.returns">
                    : <Types v-for="(ret, i) in data.returns" :key="i" :type="ret.type"/></span></h4>

            <PropTable v-for="(table, name) in data.tables" :key="name" :name="name" :data="table" :headers="true"/>
            <template v-if="data.returns && data.returns.length">
                <h4>returns:</h4>
                <template v-for="(ret, i) in data.returns">
                    <Types :type="ret.type" :key="i"/>
                    <Description :text="ret.description"/>
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
    import Description from './Description.vue';

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
            Types,
            Description
        },

        extends: ModuleComp,

        props: {
            headline: {
                type: String,
                default: 'h3'
            },
            data: Object
        }
    };
</script>
