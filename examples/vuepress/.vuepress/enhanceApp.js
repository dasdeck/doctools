import ExampleRunner from '../../../ui/app/ExampleRunner.vue';
import runtime from '../../runtime/index';
import examples from '../examples/examples.json';

import vuerunner from '../../../src/runnner/VueRunner';
import uikitrunner from '../../../src/runnner/UIkitRunner';

import 'prismjs';
import Code from 'vue-prism-component';

import UIkit from 'uikit';
import 'uikit/dist/css/uikit.css';


// debugger
export default ({
    Vue, // the version of Vue being used in the VuePress app
    options, // the options for the root Vue instance
    router, // the router instance for the app
    siteData // site metadata
  }) => {
    // ...apply enhancements to the app

    ExampleRunner.components = {
      ...ExampleRunner.components,
      Code
    };

    ExampleRunner.runtime = runtime;
    ExampleRunner.examples = examples;
    ExampleRunner.runners['vue'] = new vuerunner;
    ExampleRunner.runners['uikit'] = new uikitrunner;

    Vue.component('ExampleRunner', ExampleRunner);

  }