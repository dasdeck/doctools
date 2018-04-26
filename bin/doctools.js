#!/usr/bin/env node
/* eslint-env node */
const path = require('path');
const webpack = require('webpack');
const devServer = require('webpack-dev-server');
const parser = require('../src/parser');

const argv = require('minimist')(process.argv.slice(2), {
    '--': true,
    boolean: ['dev', 'explain'],
    string: ['config', 'search'],
    alias: {
        config: ['c', '--config'],
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

config = parser.prepareConfig(config);

//easy transport into devserver
global.doctoolsConfig = config;

if (process.mainModule.filename !== __filename) {

    module.exports = parser.parse(config);

} else if (argv.explain) {

    config.watch = false;

    const pack = parser.parse(config);
    pack.analyze().then(() => {
        const data = pack.getDataPackage();
        console.log(data);
    });

} else {

    process.argv = [...process.argv.slice(0, 2), ...argv['--']];
    //force the dev-server to use local config
    const uiWPConfig = path.join(__dirname, '..', 'ui', 'webpack.config.js');

    manualStart(uiWPConfig);
    // process.argv.push('--config');
    // process.argv.push(uiWPConfig);
    // require('webpack-dev-server/bin/webpack-dev-server');

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