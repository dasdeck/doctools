<template>
  <div>
      <div class="nomd">

        <ul uk-switcher class="uk-subnav uk-subnav-pill">
            <li><a href="">preview</a></li>
            <li><a href="">code</a></li>
        </ul>

        <div class="uk-switcher">
            <div class="preview" v-html="preview"></div>
            <div>
                <Code ref="code" :language="language">{{code}}</Code>
            </div>
        </div>
      </div>
      <div style="display:none;">
          {{`&lt;ExampleRunner id="${data.id}" resource="${data.resource}"/>`}}
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

        code() {
            return this.data.code;
        },

        preview() {
            const el = UIkit.util.$('.preview', this.$el);
            return this.runner && this.runner.preview && this.runner.preview(this.code, el) || this.code;
        },

        language() {
            return this.runner && this.runner.getLanguage(this.code);
        },

        runner() {
            return ExampleRunner.runners[this.data.lang.split(':').pop()];
        }
    }
}
export default ExampleRunner;

</script>
