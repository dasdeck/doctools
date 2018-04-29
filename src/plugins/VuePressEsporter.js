const Plugin = require('../Plugin');
const Package = require('../Package');
const path = require('path');
const fs = require('fs');
const markdownAdapterSource = '../../ui/MarkdownAdapter.min.js';


/**
 * attemts to load the described class
 * mark module for runtime analysis by setting a member runtime = true
 */
module.exports = class MarkdownExporter extends Plugin {

   

    /**
     * helper function to load the runtime for a component or module
     * @param {*} config
     * @param {*} desc
     */
    onWrite(pack, data) {

        const sidebar = _.map(data, resource => {

        });

        
      
    }

}