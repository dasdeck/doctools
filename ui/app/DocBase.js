import {findKey} from 'lodash-es';

export default {

    props: {
        initialData: Object
    },

    data() {

        return {
            data: this.initialData,
            lastRuntime: null,
            settings: {
                private: false,
                filter: ''
            }
        };

    },

    provide() {
        return {$doc: this};
    },

    methods: {

        markdown(markdown) {

            throw 'abstract call';

        },

        markdownPreprocess(markdown) {
            return markdown;
        },

        highlight(code, lang, frame = false) {

            throw 'abstract call';

        },

        getUrl(resource) {
            return `${this.uriPrefix}${resource}`;
        },

        resolveModule(nameOrResource) {

            if (this.data.resources[nameOrResource]) {
                return nameOrResource;
            } else {
                return findKey(this.data.resources, (res, key) => {
                    return key.includes(nameOrResource) || (res.name || res.fileInPackage).includes(nameOrResource);
                });
            }

        },

        getTypeUrl(type) {

            if (this.types[type]) {
                return this.getUrl(this.types[type]);
            } else if (this.nodeGlobals.includes(type)) {
                return `https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/${type}`;
            } else if (typeof window !== 'undefined' && window[type]) {
                return `https://developer.mozilla.org/docs/Web/API/${type}`;
            }

        }
    },

    computed: {

        uriPrefix() {
            return '/';
        },

        runtime() {
            if (this.data.runtime && this.data.runtime !== this.lastRuntime) {
                this.lastRuntime = this.data.runtime;
                eval(this.data.runtime);
            }
            return window.RuntimeAnalyzer && window.RuntimeAnalyzer.default;
        },

        nodeGlobals() {
            return this.data.nodeGlobals;
        },

        types() {
            return this.data && this.data.types || {};
        },

        resources() {
            return this.data && this.data.resources || {};
        },

        rootPackage() {
            return this.resources[this.data.rootPackage];
        },

        repo() {
            const root = this.rootPackage;
            return this.data.repo || (root && root.packageJson && root.packageJson.repository);

        }

    }

};