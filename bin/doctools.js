#!/usr/bin/env node
/* eslint-env node */
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const glob = require('glob');

const argv = require('minimist')(process.argv.slice(2), {alias: {
    config: ['c', '--config'],
    search: ['s', '--search']
}});

/**
 * @fileO
 * @kind binary
 * @param {String} [--config] - the config file to use
 * @param {Flag} [--explain] - cuases the doctool to only print out json, instead of starting a server
 */

const configFile = argv.config ? argv.config : path.join(process.cwd(), 'doctools.config.js');

let config = {};

if (fs.existsSync(configFile)) {
    config = require(configFile);
    console.log('config found: ', configFile, config);
}

config.base = config.base || argv._[0];
config.search = config.search || argv.search;

global.doctoolsConfig = config;

if (argv.explain) {
    const parser = require('../src/parser');
    const res = parser.parse(config);
    console.log(res);
} else {
    process.argv = [...process.argv.slice(0,2)];
    //force the dev-server to use local config
    process.argv.push('--config');
    process.argv.push(path.join(__dirname, '..', 'webpack.config.js'));
    require('webpack-dev-server/bin/webpack-dev-server');
}
