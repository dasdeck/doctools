<template>
  <div>
      <h1>{{data.name}}</h1>

      <p>{{data.packageJson.description}}</p>

        <template v-if="data.packageJson.scripts">
            <h2 >commands:</h2>
            <div v-for="(command, name) in data.packageJson.scripts">
                <code >npm run {{name}} [{{command}}] </code>
                <p v-if="data.packageJson.extra && data.packageJson.extra.scriptDocs && data.packageJson.extra.scriptDocs[name]">
                    {{data.packageJson.extra.scriptDocs[name]}}
                </p>
            </div>
        </template>

  </div>
</template>

<script>
export default {
    props: {
        data: Object
    }
}
</script>

<style>

</style>
