<template>
    <div>
        <Markdown :text="module.readme"/>
        <RepoLink/>
    </div>
</template>

<script>

    import ModuleComp from '../utils/ModuleComp.js';
    import utils from '../utils';

    export default {

        components: utils,

        extends: ModuleComp,

    };

</script>

<style>

</style>
