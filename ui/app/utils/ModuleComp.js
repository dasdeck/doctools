export default {

    inject: {

        $doc:  {from:'$doc', default: {}},
        $page: {from:'$page', default: null}
    },

    props: {
        moduleProperty: Object
    },

    computed: {
        module() {
            return this.moduleData || this.moduleProperty || this.$page && this.$page.module ||this.$doc.selectedModule;

        }
    }
}