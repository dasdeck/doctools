/* eslint-env node */

const glob = require('glob');
const fs = require('fs');
const path = require('path');
const WebpackDevServer = require('webpack-dev-server');
const Config = require('../Config');
const Plugin = require('../Plugin');
const Webpack = require('webpack');
const _ = require('lodash');

let instance = null;

module.exports = class DevServerPlugin extends Plugin {
    onLoad(app) {
        if (!instance) {
            DevServer.startWebpackDevServer(app);
        }
    }
}

class DevServer {

    constructor(app, router) {

        this.app = app;

        app.on('change', app => {

            this.appChanged();

        });

        this.router = router;

        this.createRoutes();

    }

    appChanged() {

        this.app.log('devServer:', 'change');

        this.app.analyze().then(() => {
            this.data = this.app.get();
            this.sendDataToClient(this.data);
        });

    }

    createRoutes(router = this.router, server = this) {

        const index = fs.readFileSync(__dirname + '/../../ui/index.html', 'utf8');
        router.get('/data.json', (req, res, next) => {

            const app = server.getApp();

            app.analyze().then(() => {
                const data = app.get();
                app.logFile('output', data);
                res.json(data);
                next();
            });

        });

        router.get('/data', (req, res, next) => {

            const app = server.getApp();
            app.emit('change');

            res.send('ok');
            // next();

        });

        router.get('*', function(request, response, next) {

            const app = server.getApp();
            const data = server.data = server.data || app.get();

            const pages = data.pages || data.resources;
            const url = decodeURI(request.url);

            if(_.some(app.config.server.assets, (rep, search) => {
                if (_.startsWith(request.url, search)) {
                    const srcPath = path.join(app.config.base, request.url.replace(search, rep));
                    if (fs.existsSync(srcPath)) {
                        response.sendFile(srcPath);
                        return true;
                    }
                }
            })) {}
            else if (pages[url.substr(1)] || request.url === '/') {
                response.send(index);
            } else {
                next();
            }
        });
    }

    sendDataToClient(data, message = 'doc-changed') {

        const server = this.app.serverInstance;
        server.sockWrite(server.sockets, message, data);

    }

    getApp() {

        return this.app;
    }
}

DevServer.defaultConfig = {
    getPages(app, data) {
        return _.mapValues(data, res => res.resource);
    }
}

DevServer.webPackConfig = {

    stats: {
        cached: false,
        cachedAssets: false,
        color: true
    },
    contentBase: [__dirname + '/../..'],
    watchContentBase: false,
    inline: true,
    before(app) {

        instance = new DevServer(DevServer.docTools, app);

    }
}

DevServer.startWebpackDevServer = function(app) {

    this.docTools = app;

    const cfg = path.join(__dirname, '..' , '..', 'ui', 'webpack.config.js');
    const wpConfig = require(cfg);
    const portfinder = require('portfinder');

    wpConfig.resolve = {
        alias: {
            '@base': app.config.base
        }
    };

    if (!fs.existsSync(path.join( app.config.base, 'doctools.ui.config.js'))) {
        wpConfig.externals = wpConfig.externals || {};
        wpConfig.externals['@base/doctools.ui.config.js'] = 'Vue => {}';

    }

    const compiler = Webpack(wpConfig);

    const devServerConfig = DevServer.webPackConfig;

    portfinder.basePort = devServerConfig.port || 8080;

    portfinder.getPort((err, port) => {

        devServerConfig.port = port;
        devServerConfig.host = devServerConfig.host || 'localhost';
        WebpackDevServer.addDevServerEntrypoints(wpConfig, devServerConfig);

        const server = new WebpackDevServer(compiler, devServerConfig);

        app.serverInstance = server;

        server.listen(devServerConfig.port, devServerConfig.host, function(err, res) {
            if (err) {
                throw err;
            }

            const url = `http://${devServerConfig.host}:${devServerConfig.port}`;
            console.log('server started', url);
            require('openurl').open(url);
        });
    });


}

// module.exports = DevServer;