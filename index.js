import Vue from 'vue';
import Doc from './ui/Doc.vue';
import VueRouter from 'vue-router';
import _ from 'lodash';
import Content from './ui/Content.vue';

Vue.use(VueRouter);



fetch('data.json').then(res => res.json()).then(data => {


    const router = new VueRouter({
        routes: [
            {
                path: '/component/:address', component: Content, props: (route) => {
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

