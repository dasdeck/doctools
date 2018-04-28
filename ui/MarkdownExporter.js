import Vue from 'vue';
import Prism from 'vue-prism-component';
import 'prismjs'
import 'prismjs/themes/prism.css'

import MarkdownMixin from './MarkdownMixin';
import Content from './app/Content.vue';


Vue.component('Code', Prism);
Vue.mixin(MarkdownMixin);


export default class MarkdownExporter {
    onExport(data) {
        const resources = data.resources;
        _.forEach(resources, resource => {

            const $doc = {
                data() {
                    return {
                        selectedModule:  resource,
                        resources
                    }
                }
            }

            const comp = {...Content, inject: undefined, data() { return {$doc}}};
            
            


        });
    }
}



let app;



function init() {

    const comp = Vue.extend(({...Doc}));
    app = new comp({propsData: {initialData: window.$data}, el: '#app'});

}