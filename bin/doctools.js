#!/usr/bin/env node
/* eslint-env node*/
const Config = require('../src/Config');
const DocTools = require('../src/DocTools');
const DevServerPlugin = require('../src/plugins/DevServerPlugin');

let config = {};

const minimistConf = {
    '--': true,
    boolean: ['dev', 'explain', 'server', 'watch'],
    string: ['config', 'search'],
    alias: {
        config: ['c', '--config'],
        watch: ['w', '--watch'],
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
    config.watch = argv.watch;
    config.config = argv.config;
    config.server = argv.server;

} else {

    throw 'do not include this file elsewhere!';

}

/**
 * @file
 * @kind binary
 * @param {String} [--config] - the config file to use
 * @param {Flag} [--explain] - cuases the doctool to only print out json, instead of starting a server
 */

if (argv.explain) {

    config.watch = false;

    config = new Config(config);

    const app = new DocTools(config);

    app.analyze().then(() => {
        const data = app.get();
        console.log(data);
    });

} else if (argv.server) {

    config.watch = true;

    config = new Config(config);

    config.addPlugin(new DevServerPlugin());

    new DocTools(config);

} else {

    config = new Config(config);

    const app = new DocTools(config);

    app.on('change', res => {
        app.log('package changed, updating...');
        app.analyze().then(() => {
            app.write().then(res => app.log('package updated!'));
        });
    });
    app.emit('change');

}

