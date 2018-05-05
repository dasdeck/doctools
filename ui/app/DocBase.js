export default {


    data() {
        return {data: {}}
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



    }


}