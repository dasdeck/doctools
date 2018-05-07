export default {

    inject: {

        $doc: '$doc',
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