import Component from '../Component';

import Slots from './Slots.vue';
import Components from './Components.vue';
import GlobalEvents from './GlobalEvents.vue';
import Triggers from './Triggers.vue';

export default {
    ...Component,
    Components,
    Slots,
    GlobalEvents,
    Triggers
};