
const _ = require('lodash');
const util = require('../util');

let base; //= 'module.exports';

/**
 * @file
 * the componentmapper offers functions to map a regular jsdoc file into a meaningfull json structure
 * it can also enrich the jsdoc structure with valuable runtime informations
 */


const Plugin = require('./Plugin');

module.exports = class ComponentMapper extends Plugin {

    onSerialize(desc, data) {
    }

    onMap(desc) {
    }

};