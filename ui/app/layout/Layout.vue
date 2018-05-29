<template>
    <div>
        <div v-if="data" uk-grid>
            <div class="uk-width-1-4">
                <label>
                    {{ $t('show private members:') }}
                    <input v-model="settings.private" class="uk-checkbox" type="checkbox">
                </label>

                <label>
                    {{ $t('filter:') }}
                    <input v-model="settings.filter" type="text">
                </label>

                <template>
                    <ul uk-switcher class="uk-subnav uk-subnav-pill">
                        <li v-if="data.menu && data.config.menus.menu"><a href="">menu</a></li>
                        <li ><a href="">packages</a></li>
                        <li ><a href="">files</a></li>
                    </ul>
                    <div :class="'uk-switcher'">
                        <CustomMenu v-if="data.menu && data.config.menus.menu" :menu="data.menu"/>
                        <PackageTree :data="resources[data.rootPackage]"/>
                        <FileTree :resources="resources"/>
                    </div>
                </template>
            </div>

            <router-view class="uk-width-3-4"/>

        </div>
        <div v-else>
            <div class="uk-position-center" style="text-align:center;">
                <div uk-spinner></div>
                <div v-html="$t('waiting for data...')"></div>
            </div>
        </div>
    </div>
</template>

<script>

    import PackageTree from './sidebar/PackageTree.vue';
    import FileTree from './sidebar/FileTree.vue';
    import CustomMenu from './sidebar/Menu.vue';
    import DocApp from '../DocApp.js';

    /**
     * Container Component for the doctools app ui
     */
    export default {

        components: {
            PackageTree,
            FileTree,
            CustomMenu
        },

        extends: DocApp,

        ref: '$doc'

    };
</script>
