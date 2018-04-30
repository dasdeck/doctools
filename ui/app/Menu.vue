<template>
    <div>
        <ul>
            <li v-for="entry in menu">
                {{entry.label}}
                <ModuleLink :resource="entry"/>
                <Menu v-if="entry.items && entry.items.length" :menu="entry.items"/>
            </li>
        </ul>
    </div>
</template>

<script>
import ModuleLink from './utils/ModuleLink.vue';

const Menu = {
    props: {
        menu: Array
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
