<template>
  <div>
      <h2 :id="data.longname">{{data.longname}}</h2>
        <a v-if="data.reference" :href="`#${data.reference}`" uk-scroll>
            {{data.description}}
        </a>
        <template v-else>
            <h4><code>{{data.signature}}</code></h4>
            <PropTable v-for="(table, name) in data.tables" :name="name" :data="table" :headers="true"/>
            <template v-if="data.returns && data.returns.length">
                <h4>returns:</h4>
                <template v-for="ret in data.returns">
                    <h4><code>{{ret.type.names.join('|')}}</code></h4>
                    <p>{{ret.description}}</p>
                </template>
            </template>
        </template>
    </div>
</template>

<script>
import PropTable from './PropTable.vue';

export default {
    components: {
        PropTable
    },

    props: {
        data: Object
    }
}
</script>
