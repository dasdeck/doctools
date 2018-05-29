<template>
    <div>
        <ul class="uk-list">
            <li v-for="(entry, resource) in menu">
                {{ entry.label }}
                <CustomMenu v-if="entry.items" :menu="entry.items"/>
                <ModuleLink v-else-if="!entry.items" :resource="resource"/>
            </li>
        </ul>
    </div>
</template>

<script>
import ModuleLink from '../../utils/ModuleLink.vue';

const CustomMenu = {
    props: {
        menu: [Array, Object]
    }
};

CustomMenu.components = {
    CustomMenu,
    ModuleLink
};

export default CustomMenu;
</script>

<style>

</style>
