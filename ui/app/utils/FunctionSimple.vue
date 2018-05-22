<template>
    <div :class="data.inherited ? 'inherited' : ''">

        <div v-html="$t('<h2>$functionName:</h2>', {functionName: data.simpleName})"></div>

        <a v-if="data.reference" :href="`#${data.reference}`" uk-scroll>
            <Description :text="data.description"/>
        </a>

        <template v-else>

            <code v-if="data.memberof === 'module.exports'">import { {{data.simpleName}} } from '{{module.fileInPackage}}'</code>

            <Code language="js">{{$t('UIkit.$componentName(element).$functionName($params);', {componentName: module.name,functionName:data.simpleName, params: data.params.map(param => param.name)})}}</Code>

            <Description :text="data.description"/>

            <PropTable :key="name" v-for="(table, name) in data.tables" :name="name" :data="table" :headers="true"/>

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

    import ModuleComp from './ModuleComp.js';
    import Description from './Description.vue';
    import PropTable from './PropTable.vue';
    import Code from './Code.vue';

    /**
     * renders a function
     * can also be used to render objects with a function like signatures like `event` and `trigger`
     *
     */
    export default {

        components: {
            Code,
            PropTable,
            Description
        },

        extends: ModuleComp,

        props: {

            data: Object
        }
    }
</script>
