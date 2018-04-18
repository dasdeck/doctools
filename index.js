import Vue from 'vue';
import Doc from './ui/Doc.vue';
import VueRouter from 'vue-router';
import _ from 'lodash';
import Content from './ui/Content.vue';

Vue.use(VueRouter);



fetch('data.json').then(res => res.json()).then(data => {

    window.$data = data;
    const findPackage = (data, name) => {

        if (data.name === name) {
            return data;
        }

    };

    Vue.filter('notEmpty', data => {
        debugger;
        return !_.isEmpty(data) && _.size(data);
    });

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
                path: '/package/:name',
                component: Content,
                props: (route) => {
                    return {
                        data: findPackage(data, route.params.name)
                    }
                }
            },
            {
                path: '/component/:address',
                component: Content,
                props: (route) => {
                    return {
                        data: _.get(data, route.params.address)
                    }
                }

            }
        ]
      })

    const comp = Vue.extend(({...Doc}));
    new comp({propsData: {data}, el: '#app', router})
});

