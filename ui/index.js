import Vue from 'vue';
import Doc from './Doc.vue';
import VueRouter from 'vue-router';
import _ from 'lodash';
import Content from './Content.vue';

import SockJS from 'sockjs-client';

let app;

Vue.use(VueRouter);


function setData(data) {
    window.$data = data;
    data.resources[data.name] = data;
    if (app) {
        app.data = data;
    }
}

fetch('data.json').then(res => res.json()).then(data => {

    setData(data);
    init();
});

function init() {


    const router = new VueRouter({
        routes: [

            {
                path: '/',
                redirect(route) {
                    return '/' + window.$data.resource;
                }
            },
            {
                path: '/:resource',
                component: Content,
                beforeEnter(route, to , next) {
                    next(window.$data.resources[route.params.resource] ? undefined : '/');
                },
                props: true
            }

        ]
        })

    const comp = Vue.extend(({...Doc}));
    app = new comp({propsData: {initialData: window.$data}, el: '#app', router});

    const socket = new SockJS('http://localhost:8080/sockjs-node')
    socket.onmessage = res => {
        if (res.data.indexOf('{"type":"doc-changed"') === 0) {

            const newData = JSON.parse(res.data).data;
            setData(newData);
        }
    }
}