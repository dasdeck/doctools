import Vue from 'vue';
import VueRouter from 'vue-router';
import SockJS from 'sockjs-client';

import 'prismjs'
import 'prismjs/themes/prism.css'
import _ from 'lodash-es';

import Prism from 'vue-prism-component';

import layout from './app/layout';

import ExamplerRunner, {Registry} from './app/utils/ExampleRunner.vue';

import vuerunner from '../src/runnner/VueRunner'
import uikitrunner from '../src/runnner/UIkitRunner'

import ui from '@base/doctools.ui.config.js';

ui(Vue)

Registry.runners['vue'] = new vuerunner;
Registry.runners['uikit'] = new uikitrunner;

Vue.use(VueRouter);

Vue.component('Code', Prism);

Vue.mixin({

    computed:{
        _() {
            return _;
        }
    },

    methods: {
        $t(text, vars) {
            if (vars) {
                return text.replace(/\$(\w+)/g, (all, word) => vars[word] ? vars[word] : word);
            } else {
                return text;
            }
        },
    },

    created() {
        if (this.$options.ref) {
            window[this.$options.ref] = this;
        }
    }

});

const router = new VueRouter({mode: 'history'});
const comp = Vue.extend(({...layout.Layout}));
const app = new comp({propsData: {initialData: window.$data}, el: '#app', router});

const socket = new SockJS(`${location.protocol}//${location.host}/sockjs-node`);

socket.onmessage = res => {

    if (res.data.indexOf('{"type":"doc-changed"') === 0) {

        const data = JSON.parse(res.data).data;
        window.$data = data;

        if (!app.data) {

            router.addRoutes([{
                path: '*',
                component: layout.Page
            }]);

            router.beforeEach((route, to, next) => {

                const res = route.fullPath.substr(1);

                const set = window.$data && (window.$data.pages || window.$data.resources)
                set[res] ?

                    next() : next(window.$data && window.$data.rootPackage)

            });

            if (app.$route.path === '/' && data.rootPackage) {
                router.push(`/${data.rootPackage}`);
            }

        }

        app.data = data;

    }

}

socket.onopen = res => {
    fetch('/data');
}
