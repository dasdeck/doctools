<template>

    <div>

        <Markdown v-if="module.readme" :text="module.readme"/>

        <p>
            {{module.component.description}}
        </p>

        <Mixins/>

        <Props/>

        <Methods/>

        <Emits/>

        <RepoLink/>

    </div>

</template>

<script>

import PropTable from "../utils/PropTable.vue";
import RepoLink from "../utils/RepoLink.vue";
import Function from "../utils/Function.vue";
import ModuleLink from "../utils/ModuleLink.vue";
import ModuleComp from '../utils/ModuleComp';
import Markdown from '../utils/Markdown.vue';

import {size} from "lodash-es";

import Component from './Component';

export default {

    extends: ModuleComp,

    components: {
        ...Component,
        ModuleLink,
        RepoLink,
        Markdown
    },

    provide() {
        return {$component: this};
    },

    hasContent(data) {
        return data.component && size(data.component) || data.module && data.module.description;
    }

};
</script>