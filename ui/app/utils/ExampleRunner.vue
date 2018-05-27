<template>
  <div v-if="data">
      <div class="nomd uk-position-relative uk-margin-medium">

        <ul uk-tab>
            <li><a href="#">Preview</a></li>
            <li><a href="#">Markup</a></li>
        </ul>

        <div class="uk-switcher uk-margin">
            <div v-if="error" class="error">{{error}}</div>
            <div v-else ref="preview" >
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
                        <div class="uk-icon" uk-icon icon="copy"></div>
                        </a>
                    </li>
                <li v-if="runner.edit">
                    <a @click="runner.edit(code)" class="edit" uk-tooltip="Edit on Codepen">
                    <div class="uk-icon" uk-icon icon="edit"></div></a>
                </li>
            </ul>
        </div>
      </div>
      <div style="display:none;">
          {{`&lt;ExampleRunner id="${data.id}" resource="${data.resource}"/>`}}
      </div>
  </div>
  <div v-else>could not load example data</div>
</template>

<script>

import copyToCB from 'copy-text-to-clipboard';

const langMap = {
    'vue': 'text/x-vue',
    'js': 'text/javascript',
    'html': 'text/html'
};

const Registry = {
    runners: {},
    examples: {},
    runtime: {}

}

export {
    Registry
};

export default {

    props: {
        id: String,
        dynamicRuntime: Object,
        data: {
            type: Object,
            default() {
                return Registry.examples[this.id] || null;
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

                if (!this.$refs.preview) {

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


        runtime() {
            return this.dynamicRuntime || Registry.runtime[this.data.resource];
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

        runner() {
            return Registry.runners[this.data.runnerName];
        }
    }
}

</script>