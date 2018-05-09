export default {

    inject: {

        $doc:  {from:'$doc', default: {}},
        $page: {from:'$page', default: null}
    },

    props: {
        moduleOverride: Object
    },

    computed: {
        module() {
            return this.moduleOverride || this.$page && this.$page.module ||this.$doc.selectedModule;

        }
    }
}