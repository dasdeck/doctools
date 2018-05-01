
import ExampleRunner from './app/ExampleRunner.vue';
import prismjs from 'prismjs';
import Prism from 'vue-prism-component';


// ExampleRunner.mounted = function() {
//     prismjs.highlightElement(this.$refs.code.firstChild);
// };

ExampleRunner.components = ExampleRunner.components || {};
ExampleRunner.components.Code = Prism;


export {
    ExampleRunner
};