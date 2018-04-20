#!/usr/bin/env node
/* eslint-env node */
const _ = require('lodash');
const path = require('path');
const fs = require('fs');

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

const base = argv._[0];

let config = {};

const configFile = argv.config ? argv.config : path.join(base || process.cwd(), 'doctools.config.js');
if (fs.existsSync(configFile)) {
    config = require(configFile);
    console.log('config file used: ', configFile);
}

config.base = config.base || argv._[0] || process.cwd(); //set base default early, for webpack dev server
config.search = config.search || argv.search;
config.developMode = config.developMode || argv.dev;

console.log('current config:', config);

//easy transport into devserver
global.doctoolsConfig = config;

if (argv.explain) {
    const parser = require('../src/parser');
    const res = parser.parse(config);
    console.log(res);
} else {
    process.argv = [...process.argv.slice(0, 2), ...argv['--']];
    //force the dev-server to use local config
    process.argv.push('--config');
    process.argv.push(path.join(__dirname, '..', 'webpack.config.js'));
    require('webpack-dev-server/bin/webpack-dev-server');
}
