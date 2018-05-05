export default {

    inject: {

        $doc: '$doc',
        $page: {from:'$page', default: null}
    },

    props: {
        moduleOverride: {
            type: Object,
            default() {
                // debugger;
            }
        }
    },

    computed: {
        module() {
            return this.$page && this.$page.module ||this.$doc.selectedModule;

        }
    }
}