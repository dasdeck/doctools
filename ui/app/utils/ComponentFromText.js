import {isFunction} from 'lodash-es';

export default {

    props: {
        text: String
    },

    data() {
        return {components: []};
    },

    updated() {
        this.$nextTick(() => {
            this.mountComponents();
        });
    },

    mounted() {
        this.$nextTick(() => {
            this.mountComponents();
        });
    },

    methods: {

        mountComponents() {

            this.components.forEach((comp, index) => {

                const selector = `div.placeholder${index}`;
                const el = UIkit.util.$(selector, this.$el);
                comp.$mount(el);

            });

        },

        evaluate(param , res) {
            return isFunction(param) && param(res) || param;
        }

    },

    computed: {

        parsedText() {

            this.components.forEach(comp => comp.$destroy());

            let result = this.text;
            this.replaces.forEach(replace => {

                let res;
                while(res = replace.search.exec(this.text)) {

                    let response = replace;

                    if (response.replace) {
                        response = this.evaluate(response.replace, res);
                    }

                    if (response.text) {
                        result = result.replace(res[0], this.evaluate(response.text, res));

                    } else if(response.comp) {

                        const componentConstructor = this.constructor.extend(this.evaluate(response.comp, res));
                        const component = new componentConstructor({parent: this, propsData: this.evaluate(response.propsData, res)});

                        result = result.replace(res[0], `<div class="placeholder${this.components.length}"></div>`);

                        this.components.push(component);

                    }

                }
            });

            this.$nextTick(() => {
                this.mountComponents();
            });

            return result;

        },

        replaces() {
            return [];
        }
    }
}