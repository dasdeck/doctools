<template>

    <div>

        <Props/>

        <template v-if="size(module.component)">
            <h2 id="javascript" class="uk-h3 tm-heading-fragment"><a href="#javascript">JavaScript</a></h2>
            <p>Learn more about <Link link="javascript.md">JavaScript components</Link></p>

            <h3 id="initialization" class="uk-h4 tm-heading-fragment"><a href="#initialization">Initialization</a></h3>
            <div class="uk-margin-medium">
                <Code language="js">{{$t('UIkit.$componentName(element, options);', {componentName: module.name})}}</Code>
            </div>
        </template>

        <Description :text="module.description"/>

        <EventList/>

        <Methods/>

        <Mixins/>

        <RepoLink/>

    </div>

</template>

<script>

    import Component from './Component.vue';
    import {size} from 'lodash-es'

    export default {

        extends: Component,

        methods: {
            size
        }
    };

</script>