#!/usr/bin/env node
/* eslint-env node */
const path = require('path');
const _ = require('lodash');
// const DocTools = require('../src/Doctools');
const parser = require('../src/parser');


let config = {};


const minimistConf = {
    '--': true,
    boolean: ['dev', 'explain', 'server'],
    string: ['config', 'search'],
    alias: {
        config: ['c', '--config'],
        server: ['serv', '--server'],
        dev: ['d', '--dev'],
        explain: ['e', '--explain']
    }
};

const argv = require('minimist')(process.argv.slice(2), minimistConf);

if (process.mainModule.filename === __filename) {


    config.base = argv._[0];
     //set base default early, for webpack dev server
    config.dev = argv.dev;
    config.config = argv.config;
    config.server = argv.server;
} else {

    throw 'do not include this file elsewhere!'

}


/**
 *
 *
 * @file
 * @kind binary
 * @param {String} [--config] - the config file to use
 * @param {Flag} [--explain] - cuases the doctool to only print out json, instead of starting a server
 *
 */




if (argv.explain) {

    config.watch = false;

    const pack = parser.parse(config);

    pack.analyze().then(() => {
        const data = pack.get();
        console.log(data);
        pack.dispose();
    });

} else if (config.server) {

    config.watch = true;
    global.doctoolsConfig = parser.prepareConfig(config);
    require('../src/DevServer').startWebpackDevServer();

} else {

    const app = parser.parse(config);

    app.on('change', res => {
        console.log('package changed, updating...')
        app.analyze().then(() => {
            const data = app.write().then(res => console.log('package updated!'));
        });
    });
    app.emit('change');

}

