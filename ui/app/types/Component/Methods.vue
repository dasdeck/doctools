<template>
    <div v-if="methods.length">
        <div v-html="$t('<h2>methods:</h2>')"/>
        <div v-for="method in methods">
            <FunctionSimple :data="method"/>
            <hr>
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
            /**
            * the filtered list of methods
            */
            methods() {
                return filter(
                    this.component.methods,
                    method => this.$doc.settings.private || method.access !== "private"
                );
            },
        }
    }

</script>