<template>
  <div >

<!-- This is the nav containing the toggling elements -->
<ul uk-switcher class="uk-subnav uk-subnav-pill">
    <li><a href="">preview</a></li>
    <li><a href="">code</a></li>
</ul>

<!-- This is the container of the content items -->
<div class="uk-switcher">
    <div v-html="data.code"></div>
    <Code>{{data.code}}</Code>
</div>
  </div>
</template>

<script>

import 'uikit';
// import 'uikit/dist/css/'
import UIkitRunner from '../../src/runnner/UIkitRunner';
const runnner = new UIkitRunner();

export default {
    props: {
        data: Object,
    }
}
</script>
