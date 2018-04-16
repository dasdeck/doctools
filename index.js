import Vue from 'vue';
import Doc from './ui/Doc.vue';


fetch('data.json').then(res => res.json()).then(data => {

    const comp =Vue.extend(({...Doc}));
    new comp({propsData: {data}, el: '#app'})
});

