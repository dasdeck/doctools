<template>
    <div>
        <ul class="uk-list">
            <li v-for="entry in menu">
                {{entry.label}}
                <Menu v-if="entry.items && entry.items.length" :menu="entry.items"/>
                <ModuleLink v-else-if="!entry.items" :resource="entry"/>
            </li>
        </ul>
    </div>
</template>

<script>
import ModuleLink from '../utils/ModuleLink.vue';

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
