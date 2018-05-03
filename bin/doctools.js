#!/usr/bin/env node
/* eslint-env node */
const path = require('path');
const webpack = require('webpack');
const devServer = require('webpack-dev-server');
const parser = require('../src/parser');
const _ = require('lodash');

const argv = require('minimist')(process.argv.slice(2), {
    '--': true,
    boolean: ['dev', 'explain', 'server'],
    string: ['config', 'search'],
    alias: {
        config: ['c', '--config'],
        server: ['serv', '--server'],
        search: ['s', '--search'],
        dev: ['d', '--dev'],
        explain: ['e', '--explain']
    }
});


/**
 *
 *
 * @file
 * @kind binary
 * @param {String} [--config] - the config file to use
 * @param {Flag} [--explain] - cuases the doctool to only print out json, instead of starting a server
 *
 */

let config = {};
config.base = argv._[0] || process.cwd(); //set base default early, for webpack dev server
config.search = argv.search;
config.dev = argv.dev;
config.config = argv.config;
config.server = argv.server;

config = parser.prepareConfig(config);

//easy transport into devserver
global.doctoolsConfig = config;

if (process.mainModule.filename !== __filename) {

    module.exports = parser.parse(config);

} else if (argv.explain) {

    config.watch = false;

    const pack = parser.parse(config);

    pack.analyze().then(() => {
        pack.write().then(res => {
            console.log(res);

        });
    });

} else if (config.server) {

    config.watch = true;

    process.argv = [...process.argv.slice(0, 2), ...argv['--']];
    const uiWPConfig = path.join(__dirname, '..', 'ui', 'webpack.config.js');

    manualStart(uiWPConfig);

} else {

    const pack = parser.parse(config);

    pack.on('change', res => {
        console.log('package changed, updating...')
        pack.analyze().then(() => {
            pack.write().then(res => console.log('package updated!'));
        });
    });
    pack.emit('change');

}

function manualStart(cfg) {

    const wpConfig = require(cfg);
    const devServerConfig = require(__dirname + '/../devServer');

    devServerConfig.stats = {
        cached: false,
        cachedAssets: false,
        color: true
    };

    const portfinder = require('portfinder');
    portfinder.basePort = devServerConfig.port || 8080;

    portfinder.getPort((err, port) => {

        devServerConfig.port = port;
        devServerConfig.host = devServerConfig.host || 'localhost';
        devServer.addDevServerEntrypoints(wpConfig, devServerConfig);

        const compiler = webpack(wpConfig);

        const server = new devServer(compiler, devServerConfig);

        global.doctoolsConfig.server = server;

        server.listen(devServerConfig.port, devServerConfig.host, function(err, res) {
            if (err) {
                throw err;
            }

            console.log('server started');
            console.log(`http://${devServerConfig.host}:${devServerConfig.port}`);
        });
    });

}