import Vue from 'vue';
import VueRouter from 'vue-router';
import SockJS from 'sockjs-client';

import Doc from './app/Doc.vue';
import Content from './app/Content.vue';

Vue.use(VueRouter);

let app;

function setData(data) {
    window.$data = data;
    if (app) {
        app.data = data;
    }
}

// IE compatibility?
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
                    //redirect to topmost package
                    return '/' + window.$data.rootPackage;
                }
            },
            {
                path: '/:resource',
                component: Content,
                beforeEnter(route, to, next) {
                    //redirect to root if packackage not found
                    next(window.$data.resources[route.params.resource] ? undefined : '/');
                },
                props: true
            }

        ]
    });

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