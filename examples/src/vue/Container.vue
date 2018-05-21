<template>

    <div>
        <Modal>super simple modal</Modal>
    </div>

</template>

<script>

import Modal from './Modal.vue';

/**
 * @tutorial Container
 */
export default {

    components: {
        Modal
    },

    created() {

        /**
         * @event test
         * @kind trigger
         * @param {String} a - parameter a
         *
         **/
        this.$trigger('test', ['a', 'b']);
    }

};

</script>