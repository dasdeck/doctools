export default {

    inject: ['$doc'],

    props: {
        module: {
            type: Object,
            default() {
                return this.$doc.selectedModule;
            }
        }
    }
}