<template>
  <div>
      <h1>{{data.name}}</h1>

    <template v-if="data.packageJson">

      <p>{{data.packageJson.description}}</p>

        <template v-if="data.packageJson.repository">
            <h2>install:</h2>
            <code v-if="data.packageJson.bin">npm i -g {{data.packageJson.repository.url}}</code>
            <code v-else>npm i -D {{data.packageJson.repository.url}}</code>
        </template>

        <template v-if="data.packageJson.bin">
            <h2>cli / bin:</h2>
            <div v-for="(command, name) in data.packageJson.bin">
                <code >{{name}} [{{command}}] </code>
                <p v-if="data.packageJson.extra && data.packageJson.extra.binDocs && data.packageJson.extra.binDocs[name]">
                    {{data.packageJson.extra.binDocs[name]}}
                </p>
            </div>
        </template>

        <template v-if="data.main">
            <h2>usage / api:</h2>
            {{data.main.types.file[0].examples[0].description}}
        </template>

        <template v-if="data.packageJson.scripts">
            <h2 >commands:</h2>
            <div v-for="(command, name) in data.packageJson.scripts">
                <code >npm run {{name}} [{{command}}] </code>
                <p v-if="data.packageJson.extra && data.packageJson.extra.scriptDocs && data.packageJson.extra.scriptDocs[name]">
                    {{data.packageJson.extra.scriptDocs[name]}}
                </p>
            </div>
        </template>
    </template>

    <template v-if="data.globals.trigger.length">
        <h2 >trigger:</h2>
        <Function v-for="trigger in data.globals.trigger" :key="trigger.longname" :data="trigger"/>
    </template>

  </div>
</template>

<script>
import Function from './Function.vue';

/**
 * view for package overviews
 */
export default {
    components: {
        Function
    },

    props: {
        data: Object
    }
}
</script>

<style>

</style>
