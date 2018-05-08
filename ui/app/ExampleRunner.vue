<template>
  <div v-if="data">
      <div class="nomd uk-position-relative uk-margin-medium">

        <ul uk="tab">
            <li><a href="#">Preview</a></li>
            <li><a href="#">Markup</a></li>
        </ul>

        <div class="uk-switcher uk-margin">
            <div v-if="error" class="error">{{error}}</div>
            <div v-else class="preview" >
                <div v-html="preview"></div>
            </div>
            <div>
                <Code v-if="language" :language="language">{{code}}</Code>
            </div>
        </div>

        <div class="uk-position-top-right uk-margin-small-top">
            <ul class="uk-iconnav">
                <li>
                    <a @click="copyToCB(code)" uk-tooltip="Copy to Clipboard" rel="#${id}">
                        <img class="uk-icon" src="../images/icon-clipboard.svg" >
                        </a>
                    </li>
                <li v-if="runner.edit">
                    <a @click="runner.edit(code)" class="js-codepen" uk-tooltip="Edit on Codepen">
                    <img class="uk-icon" src="../images/icon-flask.svg" ></a>
                </li>
            </ul>
        </div>
      </div>
      <div style="display:none;">
          {{`&lt;ExampleRunner id="<!-- $ -->{data.id}" resource="${data.resource}"/>`}}
      </div>
  </div>
  <div v-else>could not load example data</div>
</template>

<script>

import '../uikit-node';
import copyToCB from 'copy-text-to-clipboard';

const langMap = {
    'vue': 'text/x-vue',
    'js': 'text/javascript',
    'html': 'text/html'
}

const ExampleRunner = {

    runners: {},

    props: {
        id: String,
        dynamicRuntime: Object,
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

        copyToCB(code) {

            copyToCB(code);
        },

        createPreview(retry = true) {
            if(this.data) {

                if (!this.previewEl) {

                    if(retry) {
                        this.$nextTick(res => {
                            this.createPreview(false);
                        });
                    } else {
                        debugger;
                    }
                } else {
                    try {
                        this.error = '';
                        if (this.runner) {
                            this.preview = this.runner.preview && this.runner.preview(this) || this.code;
                        } else {
                            this.error = 'could not find runnner';
                        }
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
            return this.dynamicRuntime || ExampleRunner.runtime[this.data.resource];
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
