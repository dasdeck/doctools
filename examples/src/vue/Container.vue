<template>

  <Modal>super simple modal</Modal>

</template>

<script>

import Modal from './Modal.vue';

export default {

    components: {
        Modal
    },

    created() {
        
        /**
         * @event test
         * @kind Trigger
         * @param {String} a - parameter a
         * 
         **/
        this.$trigger('test', ['a', 'b']);
    }

}
</script>