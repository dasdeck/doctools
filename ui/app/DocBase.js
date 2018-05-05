export default {

    props: {
        initialData: Object
    },

    data() {
        return {
            data: this.initialData,
            lastRuntime: null,
            settings: {
                private: false,
                filter: ''
            }

        }
    },

    computed: {

        runtime() {
            if (this.data.runtime && this.data.runtime !== this.lastRuntime) {
                this.lastRuntime = this.data.runtime;
                eval(this.data.runtime);
            }
            return window.RuntimeProvider && window.RuntimeProvider.default;
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
            return root && root.packageJson && root.packageJson.repository;

        }

    }

};