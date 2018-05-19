<template>
    <FileTreeItem :data="structure"/>
</template>

<script>

import FileTreeItem from './FileTreeItem.vue';
import {forEach, set} from 'lodash';

export default {
    components: {
        FileTreeItem
    },
    props: {
        resources: Object
    },

    computed: {

        structure() {

            const struct = {};
            forEach(this.resources, mod => {
                const path = mod.fileInPackage.split('/').filter(p => p);
                path.shift();
                // if (mod.type !== 'package') {
                const file = path.pop().replace(/\./g, '::');
                path.push(file);
                // }
                path.push('::');
                const address = path.join('.');

                set(struct, address, mod);
            });

            // debugger;
            return struct;

        }

    }
}
</script>

<style>

</style>
