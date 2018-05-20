import ModuleComp from '../../utils/ModuleComp';

export default {

    extend: ModuleComp,

    inject: ['$component'],

    computed: {
        component() {
            return this.$component.module.component;
        }
    }
}