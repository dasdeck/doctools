import ModuleComp from '../../utils/ModuleComp';
import components from '../../utils';

export default {

    extend: ModuleComp,

    components,

    inject: ['$component'],

    computed: {
        component() {
            return this.$component.module.component;
        }
    }
}