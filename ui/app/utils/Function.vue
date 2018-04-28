<template>
    <div :class="data.inherited ? 'inherited' : ''">
        <h2 :id="data.simpleName">
            {{data.simpleName}}
        </h2>
        <a v-if="data.reference" :href="`#${data.reference}`" uk-scroll>
            {{data.description}}
        </a>
        <template v-else>
            <code v-if="data.memberof === 'module.exports'">import { {{data.simpleName}} } from '{{$parent.data.fileInPackage}}'</code>
            <p>{{data.description}}</p>

            <h4 class="signature">{{data.simpleName}}(
                <template v-for="(param, index) in data.params">
                    <Param :param="param" :module="module"/>
                    <span v-if="index < data.params.length - 1">, </span>
                </template>
                )</h4>

            <PropTable v-for="(table, name) in data.tables" :name="name" :data="table" :headers="true"/>
            <template v-if="data.returns && data.returns.length">
                <h4>returns:</h4>
                <template v-for="ret in data.returns">
                    <Types :type="ret.type"/>
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

        inject: ['$doc'],


        props: {
            data: Object,
            module: {
                type: Object,
                default() {
                    return this.$doc.selectedModule;
                }
            }
        }
    }
</script>
