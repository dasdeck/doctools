<template>
  <div v-if="data">
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
                <Code v-if="language" ref="code" :language="language">{{code}}</Code>
            </div>
        </div>
      </div>
      <div style="display:none;">
          {{`&lt;ExampleRunner id="${data.id}" resource="${data.resource}"/>`}}
      </div>
  </div>
  <div v-else>could not load example data</div>
</template>

<script>

import UIkit from '../../src/uikit-node';

const langMap = {
    'vue': 'text/x-vue',
    'js': 'text/javascript',
    'html': 'text/html'
}

const ExampleRunner = {

    runners: {},

    props: {
        id: String,
        data: {
            type: Object,
            default() {
                return ExampleRunner.examples[this.id] || null;
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
            if(this.data) {

                if (!this.previewEl) {
                    this.$nextTick(res => {
                        this.createPreview();
                    });
                } else {
                    try {
                        this.error = '';
                        this.preview = this.runner && this.runner.preview && this.runner.preview(this) || this.code;
                    } catch (e) {
                        this.error = e.message;
                    }
                }
            }
        }
    },

    mounted() {
        this.createPreview();
    },

    computed: {

        previewEl() {
            return UIkit.util.$('.preview', this.$el, this.data.resource);
        },

        runtime() {
            return ExampleRunner.runtime[this.data.resource];
        },

        moduleName() {
            return this.data.name;
        },

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
                return this.data && this.data.code;
            },
            set(code) {
                if (this.data) {

                    this.data.code = code;
                }
            }
        },

        language() {
            return this.runner && this.runner.getLanguage(this.code);
        },

        type() {
            return this.data && this.data.lang.split(':').pop();
        },

        runner() {
            return ExampleRunner.runners[this.type];
        }
    }
}

ExampleRunner.examples = {};
ExampleRunner.runtime = {};

export default ExampleRunner;

</script>
