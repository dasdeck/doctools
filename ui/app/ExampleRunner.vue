<template>
  <div>
      <div class="nomd">

    <ul uk-switcher class="uk-subnav uk-subnav-pill">
        <li><a href="">preview</a></li>
        <li><a href="">code</a></li>
    </ul>

    <div class="uk-switcher">
        <div v-html="data.code"></div>
        <Code ref="code" :language="language">{{data.code}}</Code>
    </div>
      </div>
      <div style="display:none;">
          {{`&lt;ExampleRunner id="${data.id}"/>`}}
      </div>
  </div>
</template>

<script>


const ExampleRunner = {

    runners: {},

    props: {
        id: String,
        data: {
            type: Object,
            default() {
                return ExampleRunner.examples && ExampleRunner.examples[this.id]
            }
        }
    },

    computed: {
        language() {
            return this.runner && this.runner.getLanguage();
        },

        runner() {
            return ExampleRunner.runners[this.data.lang.split(':').pop()];
        }
    }
}
export default ExampleRunner;

</script>
