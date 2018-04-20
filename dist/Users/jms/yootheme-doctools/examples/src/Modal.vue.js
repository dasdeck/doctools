(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading wasm modules
/******/ 	var installedWasmModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// object with all compiled WebAssembly.Modules
/******/ 	__webpack_require__.w = {};
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/Modal.vue");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../node_modules/babel-loader/lib/index.js!../node_modules/vue-loader/lib/selector.js?type=script&index=0!./src/Modal.vue":
/*!***********************************************************************************************************************!*\
  !*** ../node_modules/babel-loader/lib!../node_modules/vue-loader/lib/selector.js?type=script&index=0!./src/Modal.vue ***!
  \***********************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var uikit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uikit */ \"uikit\");\n/* harmony import */ var uikit__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(uikit__WEBPACK_IMPORTED_MODULE_0__);\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n//\n\n\n\n/**\n * A reusable modal component using UIkit.modal and VUE\n * @example\n * <Modal><ChilComponent/></Modal>\n */\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n\n    props: {\n        /**\n         * When using the modal with a content component, you can pass the child's component properties here\n         * @example\n         * <Modal :props=\"{type:'checkbox'}\" :content=\"InputConpnent\"/>\n         */\n        props: {\n            type: Object,\n            required: true\n        },\n\n        /**\n         * A component descriptor to construct a child element from\n         */\n        content: Object,\n\n        /**\n         * Optional uk-width-($with) class for the modal to use\n         **/\n        width: {\n            type: String\n        },\n\n        /**\n         * Adds the uk-modal-Container class\n         */\n        container: Boolean\n    },\n\n    data: function data() {\n        return {\n            /**\n             * A list of registered events\n             * @type {String[]}\n             */\n            contentEvents: [],\n            /**\n             * Weather this Modal has been opened\n             * @type {Boolean}\n             */\n            opened: false\n\n            /**\n             * the width class resolver\n             */\n\n        };\n    },\n\n\n    computed: {\n\n        /**\n         * resolves the used width class\n         * @returns {String} The class to be used in the modal\n         */\n        clsWidth: function clsWidth() {\n            return this.width ? 'uk-width-' + this.width : '';\n        }\n    },\n\n    /** @private */\n    beforeDestroy: function beforeDestroy() {\n        this.modal && this.modal.$destroy(true);\n    },\n\n\n    methods: {\n\n        /**\n         * @returns {VueComponentInstance} Returns the current content component\n         */\n        getContent: function getContent() {\n            return this.$slots.default[0].componentInstance || this.$refs.content;\n        },\n\n\n        /**\n         * Registers a listener on the content component\n         * @param {String} event - The event name\n         * @param {Function} handler - the function to be called on the event\n         */\n        contentOnce: function contentOnce(event, handler) {\n            var _this = this;\n\n            this.contentEvents.push(event);\n            this.getContent().$once(event, function () {\n                handler.apply(undefined, arguments);\n                _this.close();\n            });\n        },\n\n\n        /**\n         * open the modal\n         * @param {Object} [options]\n         * @param {Object} options.events - Hash of listeners to be registered to the content component to be executed once\n         * @returns {Promise.<this>} Returns a promise resolving with this modal when the content is ready\n         */\n        open: function open(_ref) {\n            var _this2 = this;\n\n            var events = _ref.events;\n\n            if (!this.modal) {\n                this.modal = uikit__WEBPACK_IMPORTED_MODULE_0___default.a.modal(this.$refs.modal, { stack: true });\n            }\n\n            return this.modal.show().then(function () {\n\n                if (events) {\n                    Object.keys(events).forEach(function (event) {\n                        var handler = events[event];\n                        _this2.contentOnce(event, handler);\n                    });\n                }\n                return _this2;\n            });\n        },\n\n\n        /**\n         * Closes the modal\n         * @returns {Promise} A promise that resolves when the modal is closed\n         */\n        close: function close() {\n            return this.modal.hide();\n        },\n\n\n        /**\n         * @private\n         */\n        onHidden: function onHidden() {\n            this.getContent().$off(this.contentEvents);\n\n            /**\n             * triggered when the modal has been closed\n             * @event close\n             */\n            this.$emit('close');\n            this.opened = false;\n        }\n    }\n\n});\n\n//# sourceURL=webpack:///./src/Modal.vue?../node_modules/babel-loader/lib!../node_modules/vue-loader/lib/selector.js?type=script&index=0");

/***/ }),

/***/ "../node_modules/vue-loader/lib/runtime/component-normalizer.js":
/*!**********************************************************************!*\
  !*** ../node_modules/vue-loader/lib/runtime/component-normalizer.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return normalizeComponent; });\n/* globals __VUE_SSR_CONTEXT__ */\n\n// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).\n// This module is a runtime utility for cleaner component module output and will\n// be included in the final webpack user bundle.\n\nfunction normalizeComponent (\n  scriptExports,\n  render,\n  staticRenderFns,\n  functionalTemplate,\n  injectStyles,\n  scopeId,\n  moduleIdentifier, /* server only */\n  shadowMode /* vue-cli only */\n) {\n  scriptExports = scriptExports || {}\n\n  // ES6 modules interop\n  var type = typeof scriptExports.default\n  if (type === 'object' || type === 'function') {\n    scriptExports = scriptExports.default\n  }\n\n  // Vue.extend constructor export interop\n  var options = typeof scriptExports === 'function'\n    ? scriptExports.options\n    : scriptExports\n\n  // render functions\n  if (render) {\n    options.render = render\n    options.staticRenderFns = staticRenderFns\n    options._compiled = true\n  }\n\n  // functional template\n  if (functionalTemplate) {\n    options.functional = true\n  }\n\n  // scopedId\n  if (scopeId) {\n    options._scopeId = scopeId\n  }\n\n  var hook\n  if (moduleIdentifier) { // server build\n    hook = function (context) {\n      // 2.3 injection\n      context =\n        context || // cached call\n        (this.$vnode && this.$vnode.ssrContext) || // stateful\n        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional\n      // 2.2 with runInNewContext: true\n      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {\n        context = __VUE_SSR_CONTEXT__\n      }\n      // inject component styles\n      if (injectStyles) {\n        injectStyles.call(this, context)\n      }\n      // register component module identifier for async chunk inferrence\n      if (context && context._registeredComponents) {\n        context._registeredComponents.add(moduleIdentifier)\n      }\n    }\n    // used by ssr in case component is cached and beforeCreate\n    // never gets called\n    options._ssrRegister = hook\n  } else if (injectStyles) {\n    hook = shadowMode\n      ? function () { injectStyles.call(this, this.$root.$options.shadowRoot) }\n      : injectStyles\n  }\n\n  if (hook) {\n    if (options.functional) {\n      // for template-only hot-reload because in that case the render fn doesn't\n      // go through the normalizer\n      options._injectStyles = hook\n      // register for functioal component in vue file\n      var originalRender = options.render\n      options.render = function renderWithStyleInjection (h, context) {\n        hook.call(context)\n        return originalRender(h, context)\n      }\n    } else {\n      // inject component registration as beforeCreate hook\n      var existing = options.beforeCreate\n      options.beforeCreate = existing\n        ? [].concat(existing, hook)\n        : [hook]\n    }\n  }\n\n  return {\n    exports: scriptExports,\n    options: options\n  }\n}\n\n\n//# sourceURL=webpack:///../node_modules/vue-loader/lib/runtime/component-normalizer.js?");

/***/ }),

/***/ "../node_modules/vue-loader/lib/template-compiler/index.js?{\"id\":\"data-v-524d3804\",\"hasScoped\":false,\"optionsId\":\"0\",\"buble\":{\"transforms\":{}}}!../node_modules/vue-loader/lib/selector.js?type=template&index=0!./src/Modal.vue":
/*!******************************************************************************************************************************************************************************************************************************!*\
  !*** ../node_modules/vue-loader/lib/template-compiler?{"id":"data-v-524d3804","hasScoped":false,"optionsId":"0","buble":{"transforms":{}}}!../node_modules/vue-loader/lib/selector.js?type=template&index=0!./src/Modal.vue ***!
  \******************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"render\", function() { return render; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"staticRenderFns\", function() { return staticRenderFns; });\nvar render = function() {\n  var _vm = this\n  var _h = _vm.$createElement\n  var _c = _vm._self._c || _h\n  return _c(\n    \"div\",\n    {\n      directives: [\n        { name: \"show\", rawName: \"v-show\", value: false, expression: \"false\" }\n      ]\n    },\n    [\n      _vm._ssrNode(\n        \"<div\" +\n          _vm._ssrClass(null, { \"uk-modal-Container\": _vm.container }) +\n          \">\",\n        \"</div>\",\n        [\n          _vm._ssrNode(\n            \"<div\" +\n              _vm._ssrClass(null, [\"uk-modal-dialog\", _vm.clsWidth]) +\n              \">\",\n            \"</div>\",\n            [\n              _vm.opened\n                ? _vm._ssrNode(\n                    \"<div>\",\n                    \"</div>\",\n                    [\n                      _c(\n                        _vm.content,\n                        _vm._b(\n                          { ref: \"content\", tag: \"component\" },\n                          \"component\",\n                          _vm.props,\n                          false\n                        )\n                      ),\n                      _vm._ssrNode(\" \"),\n                      _vm._t(\"default\")\n                    ],\n                    2\n                  )\n                : _vm._e()\n            ]\n          )\n        ]\n      )\n    ]\n  )\n}\nvar staticRenderFns = []\nrender._withStripped = true\n\n\n//# sourceURL=webpack:///./src/Modal.vue?../node_modules/vue-loader/lib/template-compiler?%7B%22id%22:%22data-v-524d3804%22,%22hasScoped%22:false,%22optionsId%22:%220%22,%22buble%22:%7B%22transforms%22:%7B%7D%7D%7D!../node_modules/vue-loader/lib/selector.js?type=template&index=0");

/***/ }),

/***/ "./src/Modal.vue":
/*!***********************!*\
  !*** ./src/Modal.vue ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Modal_vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !babel-loader!../../node_modules/vue-loader/lib/selector?type=script&index=0!./Modal.vue */ \"../node_modules/babel-loader/lib/index.js!../node_modules/vue-loader/lib/selector.js?type=script&index=0!./src/Modal.vue\");\n/* empty/unused harmony star reexport *//* harmony import */ var _node_modules_vue_loader_lib_template_compiler_index_id_data_v_524d3804_hasScoped_false_optionsId_0_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Modal_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/vue-loader/lib/template-compiler/index?{\"id\":\"data-v-524d3804\",\"hasScoped\":false,\"optionsId\":\"0\",\"buble\":{\"transforms\":{}}}!../../node_modules/vue-loader/lib/selector?type=template&index=0!./Modal.vue */ \"../node_modules/vue-loader/lib/template-compiler/index.js?{\\\"id\\\":\\\"data-v-524d3804\\\",\\\"hasScoped\\\":false,\\\"optionsId\\\":\\\"0\\\",\\\"buble\\\":{\\\"transforms\\\":{}}}!../node_modules/vue-loader/lib/selector.js?type=template&index=0!./src/Modal.vue\");\n/* harmony import */ var _node_modules_vue_loader_lib_runtime_component_normalizer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/vue-loader/lib/runtime/component-normalizer */ \"../node_modules/vue-loader/lib/runtime/component-normalizer.js\");\n/* script */\n\n\n/* template */\n\n/* template functional */\nvar __vue_template_functional__ = false\n/* styles */\nvar __vue_styles__ = null\n/* scopeId */\nvar __vue_scopeId__ = null\n/* moduleIdentifier (server only) */\nvar __vue_module_identifier__ = \"0566cbda\"\n\nvar Component = Object(_node_modules_vue_loader_lib_runtime_component_normalizer__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(\n  _babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Modal_vue__WEBPACK_IMPORTED_MODULE_0__[\"default\"],\n  _node_modules_vue_loader_lib_template_compiler_index_id_data_v_524d3804_hasScoped_false_optionsId_0_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Modal_vue__WEBPACK_IMPORTED_MODULE_1__[\"render\"],\n  _node_modules_vue_loader_lib_template_compiler_index_id_data_v_524d3804_hasScoped_false_optionsId_0_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Modal_vue__WEBPACK_IMPORTED_MODULE_1__[\"staticRenderFns\"],\n  __vue_template_functional__,\n  __vue_styles__,\n  __vue_scopeId__,\n  __vue_module_identifier__\n)\nComponent.options.__file = \"src/Modal.vue\"\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Component.exports);\n\n\n//# sourceURL=webpack:///./src/Modal.vue?");

/***/ }),

/***/ "uikit":
/*!************************!*\
  !*** external "UIkit" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"UIkit\");\n\n//# sourceURL=webpack:///external_%22UIkit%22?");

/***/ })

/******/ })));