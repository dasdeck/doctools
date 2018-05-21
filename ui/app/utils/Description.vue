<template>
    <p v-html="html"></p>
</template>

<script>

    import ModuleComp from './ModuleComp';
    import ComponentFromText from './ComponentFromText';
    import Type from './Type.vue';
    import Link from './Link.vue';

    export default {

        extends: ComponentFromText,

        mixins: [ModuleComp],

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
                ]
            },

            html() {
                return this.parsedText && this.$doc.markdown(this.parsedText);
            }
        }
    }
</script>