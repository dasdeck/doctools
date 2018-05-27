<template>
    <div>
        <ul class="uk-list">
            <li v-for="(entry, resource) in menu">
                {{entry.label}}
                <Menu v-if="entry.items" :menu="entry.items"/>
                <ModuleLink v-else-if="!entry.items" :resource="resource"/>
            </li>
        </ul>
    </div>
</template>

<script>
import ModuleLink from '../../utils/ModuleLink.vue';

const Menu = {
    props: {
        menu: [Array, Object]
    }
}

Menu.components = {
    Menu,
    ModuleLink
}

export default Menu;
</script>

<style>

</style>
