// import {Class, Togglable} from '../mixin/index';
// import {$, $$, attr, filter, getIndex, hasClass, includes, index, toggleClass, unwrap, wrapAll} from '../util/index';
import Togglable from './togglable';
const Class = Togglable;

/**
 * @file
 * @type {UIkitComponent}
 */

 /**
  * test
  */
export function test() {

}

 /**
  * an accordion component
  */
export default {

    mixins: [Class, Togglable],

    props: {
        /**
         * CSSo selector of the element(s) to toggle.
         */
        targets: String,
        /**
         * Index of the element to open initially.
         */
        active: null,
        /**
         * Allow all items to be closed.
         */
        collapsible: Boolean,
        /**
         * Allow multiple open items.
         */
        multiple: Boolean,
        /**
         * The toggle selector, which toggles accordion items.
         */
        toggle: String,
        /**
         * The content selector, which selects the accordion content elements.
         */
        content: String,
        /**
         * The transition to use when revealing items. Use keyword for easing functions.
         */
        transition: String
    },

    defaults: {
        targets: '> *',
        active: false,
        animation: [true],
        collapsible: true,
        multiple: false,
        clsOpen: 'uk-open',
        toggle: '> .uk-accordion-title',
        content: '> .uk-accordion-content',
        transition: 'ease'
    },

    computed: {

        /**
         * Items that are inside this accordion
         * @private
         * @param {Object.target} param0
         * @param {NodeLike} $el
         * @returns {NodeLike[]} Returns all nodes insinde this accordion
         */
        items({targets}, $el) {
            return $$(targets, $el);
        }

    },

    events: [

        {

            name: 'click',

            delegate() {
                return `${this.targets} ${this.$props.toggle}`;
            },

            handler(e) {
                e.preventDefault();
                this.toggle(index($$(`${this.targets} ${this.$props.toggle}`, this.$el), e.current));
            }

        }

    ],

    connected() {

        if (this.active === false) {
            return;
        }

        const active = this.items[Number(this.active)];
        if (active && !hasClass(active, this.clsOpen)) {
            this.toggle(active, false);
        }
    },

    update() {

        this.items.forEach(el => this._toggleImmediate($(this.content, el), hasClass(el, this.clsOpen)));

        const active = !this.collapsible && !hasClass(this.items, this.clsOpen) && this.items[0];
        if (active) {
            this.toggle(active, false);
        }
    },

    methods: {

        /**
         * the toglle method to open or close accordions programatically
         * @param {NodeLike} item
         * @param {*} animate
         */
        toggle(item, animate) {

            const index = getIndex(item, this.items);
            const active = filter(this.items, `.${this.clsOpen}`);

            item = this.items[index];

            item && [item]
                .concat(!this.multiple && !includes(active, item) && active || [])
                .forEach(el => {

                    const isItem = el === item;
                    const state = isItem && !hasClass(el, this.clsOpen);

                    if (!state && isItem && !this.collapsible && active.length < 2) {
                        return;
                    }

                    toggleClass(el, this.clsOpen, state);

                    const content = el._wrapper ? el._wrapper.firstElementChild : $(this.content, el);

                    if (!el._wrapper) {
                        el._wrapper = wrapAll(content, '<div>');
                        attr(el._wrapper, 'hidden', state ? '' : null);
                    }

                    this._toggleImmediate(content, true);
                    this.toggleElement(el._wrapper, state, animate).then(() => {
                        if (hasClass(el, this.clsOpen) === state) {

                            if (!state) {
                                this._toggleImmediate(content, false);
                            }

                            el._wrapper = null;
                            unwrap(content);
                        }
                    });

                });
        }

    }
};