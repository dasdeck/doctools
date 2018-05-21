<template>

    <div>

        <Description :text="module.description"/>

        <Props/>

        <Methods/>

        <Events/>

        <Mixins/>

        <RepoLink/>

    </div>

</template>

<script>

import utils from '../utils';
import ModuleComp from '../utils/ModuleComp';

import {size} from "lodash-es";

import Component from './Component';

export default {

    extends: ModuleComp,

    components: {
        ...Component,
        ...utils
    },

    provide() {
        return {$component: this};
    },

    hasContent(data) {
        return data.component && size(data.component) || data.module && data.module.description;
    }

};
</script>