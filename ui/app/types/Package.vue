<template>
    <div>
        <template v-if="module.packageJson">

            <p>{{module.packageJson.description}}</p>

            <template v-if="module.packageJson.repository">
                <h2>install:</h2>
                <code v-if="module.packageJson.bin">npm i -g {{module.packageJson.repository.url}}</code>
                <code v-else>npm i -D {{module.packageJson.repository.url}}</code>
            </template>

            <template v-if="module.packageJson.bin">
                <h2>cli / bin:</h2>
                <div v-for="(command, name) in module.packageJson.bin">
                    <code>{{name}} [{{command}}] </code>
                    <p v-if="module.packageJson.extra && module.packageJson.extra.binDocs && module.packageJson.extra.binDocs[name]">
                        {{module.packageJson.extra.binDocs[name]}}
                    </p>
                </div>
            </template>

            <template v-if="module.main">
                <h2>usage / api:</h2>
                {{module.main.types.file[0].examples[0].description}}
            </template>

            <template v-if="module.packageJson.scripts">
                <h2>commands:</h2>
                <div v-for="(command, name) in module.packageJson.scripts">
                    <code>npm run {{name}} [{{command}}] </code>
                    <p v-if="module.packageJson.extra && module.packageJson.extra.scriptDocs && module.packageJson.extra.scriptDocs[name]">
                        {{module.packageJson.extra.scriptDocs[name]}}
                    </p>
                </div>
            </template>
        </template>

        <a v-if="repoLink" :href="repoLink" v-html="$t('edit in repo')"></a>

    </div>
</template>

<script>
    import utils from '../utils';
    import ModuleComp from '../utils/ModuleComp';
    import {size, omit} from 'lodash-es';
    /**
     * view for package overviews
     */
    export default {

        extends: ModuleComp,

        components: utils,

        hasContent(module) {
                return module.packageJson && !!size(omit(module.packageJson, 'name'));
        }

    }
</script>

<style>

</style>
