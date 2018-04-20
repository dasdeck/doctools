import Vue from 'vue';
import Doc from './Doc.vue';
import VueRouter from 'vue-router';
import _ from 'lodash';
import Content from './Content.vue';

Vue.use(VueRouter);

fetch('data.json').then(res => res.json()).then(data => {

    window.$data = data;

    data.resources[data.name] = data;

    const router = new VueRouter({
        routes: [

            {
                path: '/',
                redirect: (route) => {
                    if (data.type === 'package') {
                        return '/package/' + data.name;
                    }
                }
            },
            {
                path: '/:resource',
                component: Content,
                props: (route) => {
                    return {
                        data: data.resources[route.params.resource]
                    }
                }
            }

        ]
      })

    const comp = Vue.extend(({...Doc}));
    new comp({propsData: {data}, el: '#app', router})
});

