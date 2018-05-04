<template>

    <div v-show="false">
        <div ref="modal" :class="{'uk-modal-Container': container}" @beforeshow.self="opened = true" @hidden.self="onHidden">
            <div :class="['uk-modal-dialog', clsWidth]">
                <div v-if="opened">
                    <component ref="content" v-bind="props " :is="content"/>
                    <!-- @slot default The slot for the
                    content if slotted method is used -->
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>

</template>

<script>

    import UIkit from 'uikit';

    /**
     * Reusable modal component using UIkit.modal and VUE. Rad!
     * @example
     * <Modal><ChilComponent/></Modal>
     */
    export default {

        props: {
            /**
             * When using the modal with a content component, you can pass the child's component properties here
             * @example
             * <Modal :props="{type:'checkbox'}" :content="InputConpnent"/>
             */
            props: {
                type: Object,
                required: false
            },

            /**
             * a test propertee
             */
            test: String,

            /**
             * A component descriptor to construct a child element from
             */
            content: Object,

            /**
             * Optional uk-width-($with) class for the modal to use.
             **/
            width: {
                type: String
            },

            /**
             * Adds the uk-modal-Container class
             */
            container: Boolean
        },

        data() {
            return {
                /**
                 * A list of registered events
                 * @type {String[]}
                 */
                contentEvents: [],
                /**
                 * Weather this Modal has been opened
                 * @type {Boolean}
                 */
                opened: false,

                /**
                 * the width class resolver
                 */

            };
        },

        computed: {

            /**
             * resolves the used width class
             * @returns {String} The class to be used in the modal
             */
            clsWidth() {
                return this.width ? `uk-width-${this.width}` : '';
            }
        },

        /** @private */
        beforeDestroy() {
            this.modal && this.modal.$destroy(true);
        },

        methods: {

            /**
             * @returns {VueComponentInstance} Returns the current content component
             */
            getContent() {
                return this.$slots.default[0].componentInstance || this.$refs.content;
            },

            /**
             * Registers a listener on the content component
             * @param {String} event - The event name
             * @param {Function} handler - the function to be called on the event
             */
            contentOnce(event, handler) {
                this.contentEvents.push(event);
                this.getContent().$once(event, (...args) => {
                    handler(...args);
                    this.close();
                });
            },

            /**
             * open the modal
             * @param {Object} [options]
             * @param {Object} options.events - Hash of listeners to be registered to the content component to be executed once
             * @returns {Promise.<this>} Returns a promise resolving with this modal when the content is ready
             */
            open(options = {}) {

                const events = options.events;
                if (!this.modal) {
                    this.modal = UIkit.modal(this.$refs.modal, {stack: true});
                }

                const p = this.modal.show();

                return p && p.then(() => {

                    if (events) {
                        Object.keys(events).forEach(event => {
                            const handler = events[event];
                            this.contentOnce(event, handler);
                        });
                    }
                    return this;
                });
            },

            /**
             * Closes the modal
             * @returns {Promise} A promise that resolves when the modal is closed.
             */
            close() {
                return this.modal.hide();
            },

            /**
             * @private
             */
            onHidden() {
                const content = this.getContent();
                content && content.$off && content.$off(this.contentEvents);

                /**
                 * triggered when the modal has been closed
                 * @event close
                 */
                this.$emit('close');
                this.opened = false;
            }
        }
    };

</script>

<docs name="readme">
I can write as much as I want here because this block is called "readme"

```html

<template>
    <div>{{test}}</div>
</template>
<script>
export default {
    computed: {
        test() {
            return 'tested!';
        },
        created() {
            console.log('example created');
        }
    }
}
</script>

```

This is a real example that uses the actual code:

```html
<template>
    <div>
        <Modal ref="modal">{{test}}</Modal>
        <button @click="$refs.modal.open()">open motal</button>
    </div>
</template>
<script>
export default {
    computed: {
        test() {
            return 'tested here!';
        },
        created() {
            console.log('example created');
        }
    }
}
</script>

```

more text
</docs>

<docs name="example1">

this stuff is ignored as of yet
</docs>