<template>
    <div>
        <Markdown :text="module.readme"/>
        <RepoLink/>
    </div>
</template>

<script>

import ExampleRunner, {Registry} from '../ExampleRunner.vue';
import ModuleComp from '../utils/ModuleComp.js';
import RepoLink from '../utils/RepoLink.vue';
import Markdown from '../utils/Markdown.vue';

export default {

    components: {
        Markdown,
        RepoLink
    },


    extends: ModuleComp,


}

</script>

<style>

</style>
