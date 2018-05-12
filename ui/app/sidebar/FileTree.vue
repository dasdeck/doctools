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
                let file;
                if (mod.type !== 'package') {
                    file = path.pop().replace(/\./g, '::');
                    path.push(file);
                }
                path.push('::');
                const address = path.join('.');

                set(struct, address, mod);
            });

            return struct;

        }

    }
}
</script>

<style>

</style>
