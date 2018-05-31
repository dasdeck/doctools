<template>
    <div v-html="html"></div>
</template>

<script>

    import ModuleComp from './ModuleComp';
    import ComponentFromText from './ComponentFromText';
    import Type from './Type.vue';
    import Link from './Link.vue';

    export default {

        extends: ModuleComp,

        mixins: [ComponentFromText],

        props: {
            trim: Boolean
        },

        computed: {

            replaces() {
                return [
                    {
                        search: /{@type {(.*?)} ?(.*?)}/g,
                        comp: Type,
                        propsData: res => ({type: res[1]})

                    },
                    {
                        search: /{@link (.*?)}/g,
                        comp: Link,
                        propsData: res => ({link: res[1]})
                    }
                ];
            },

            html() {
                const res = this.parsedText && this.$doc.markdown(this.parsedText);
                const trimmed = this.trim && res ? res.substr(3, res.length - 8) : res;
                return trimmed;
            }
        }
    };
</script>