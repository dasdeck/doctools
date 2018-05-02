<template>
  <div>
      <div class="nomd">

        <ul uk-switcher class="uk-subnav uk-subnav-pill">
            <li><a href="">preview</a></li>
            <li><a href="">code</a></li>
        </ul>

        <div class="uk-switcher">
            <div class="preview" >
                <div v-html="preview"></div>
            </div>
            <div>
                <!-- <Code ref="code" v-model="code" :options="codemirrorOpts" :language="language">{{code}}</Code> -->
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

// import UIkit from 'uikit';
// import { codemirror } from 'vue-codemirror';
// import 'codemirror/lib/codemirror.css'
// import 'codemirror/mode/vue/vue.js'

const langMap = {
    'vue': 'text/x-vue',
    'js': 'text/javascript',
    'html': 'text/html'
}

const ExampleRunner = {

    // components: {
    //     Code: codemirror
    // },

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

    data() {
        return {
            error: '',
            preview: '...loading'
        }
    },

    watch: {
        code() {
            this.createPreview();
        }
    },
    methods: {
        createPreview() {
            const el = UIkit.util.$('.preview', this.$el, this.data.resource);
            if (!el) {
                Vue.nextTick(res => {
                    this.createPreview();
                });
            } else {
                try {
                    this.error = '';
                    this.preview = this.runner && this.runner.preview && this.runner.preview(this.code, el.firstChild) || this.code;
                } catch (e) {
                    this.error = e.message;
                }
            }
        }
    },

    mounted() {
        this.createPreview();
    },

    computed: {
        codemirrorOpts(){
            return {
                mode: langMap[this.type],
                theme: 'base16-dark',
                lineNumbers: true,
                line: true
            }
        },
        code: {
            get() {
                return this.data.code;
            },
            set(code) {
                this.data.code = code;
            }
        },

        language() {
            return this.runner && this.runner.getLanguage(this.code);
        },

        type() {
            return this.data.lang.split(':').pop();
        },

        runner() {
            return ExampleRunner.runners[this.type];
        }
    }
}
export default ExampleRunner;

</script>
