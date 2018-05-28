import {some} from 'lodash-es';


export default {

    inject: {

        $doc:  {from:'$doc', default: {}},
        $page: {from:'$page', default: null},
        $module: {from: '$module', default: null}
    },

    provide() {
        return {$module: this};
    },

    props: {
        moduleProperty: Object
    },

    computed: {

        module() {
            return this.moduleData || this.moduleProperty || this.$module.module || this.$page && this.$page.module ||this.$doc.selectedModule;
        },

        repoLink() {
            if  (this.$doc.repo) {

                const shorthands = {
                    'github:': 'https://github.com'
                }

                let url = this.$doc.repo.url;

                if(!some(shorthands, (rep, ser) => url.includes(ser) && url.replace(ser, rep + '/'))) {
                    url = `${Object.values(shorthands)[0]}/${url}`;
                }

                return `${url}/tree/master/${this.$doc.repo.workspace || ''}/${this.module.fileInPackage}`;
            }
        },
    }
}