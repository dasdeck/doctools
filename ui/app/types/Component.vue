

<script>

import utils from '../utils';
import ModuleComp from '../utils/ModuleComp';
import Component from './Component/index';

import {size} from "lodash-es";

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