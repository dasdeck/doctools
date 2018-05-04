const RuntimeAnalyzer = require('./RuntimeAnalyzer');
const util = require('../util');
const fs = require('fs');
const tempfile = require('tempfile');
const _ = require('lodash');
const webpack = require('webpack');
const MemFs = require('memory-fs');
const requireFromString = require('require-from-string');
const Package = require('../Package');
const path = require('path');
const mkpath = require('mkpath');

/**
 * attemts to load the described class
 * mark module for runtime analysis by setting a member runtime = true
 */
class RuntimeProvider extends RuntimeAnalyzer {

    constructor(config = RuntimeProvider.defaultOptions) {
        super(config);

        console.log(this.constructor.name);
    }

    /**
     * helper function to load the runtime for a component or module
     * @param {*} config
     * @param {*} desc
     */
    onAnalyze(pack) {

        return this.getScript();
    }

    scriptChanged() {

        if (this.config.output) {
            this.writeToDisk();
        }

    }


    onGet(desc, data) {

        if (this.config.serve) {
            data[this.config.serve] = this.script;
        }
    }


    getScript() {
        if (this.script) {
            return Promise.resolve(this.script);
        } else {
            this.run();
            return new Promise(resolve => {
                this.once('built', res => {
                    resolve(this.script);
                });
            })
        }
    }


    fileChanged(file) {
        //simple trigger a change after webpack
        this.patched = true;
    }

}

RuntimeProvider.defaultOptions = {
    watch: true,
    output: false,
    libraryTarget: 'umd',
    library: 'runtime',
    serve: 'runtime',
    target: 'web',
}

module.exports = RuntimeProvider;