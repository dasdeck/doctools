/* eslint-env node */

const glob = require('glob');
const fs = require('fs');
const path = require('path');
const WebpackDevServer = require('webpack-dev-server');
const Webpack = require('webpack');
const Config = require('./Config');

class DevServer {

    constructor(config, router) {

        this.router = router;
        this.config = config;


        if (config.dev) {

            fs.watch(__dirname, {recursive: true}, (e, file) => this.sourceChanged(file));
            // fs.watch(__dirname + '/ui', {recursive: true}, (e, file) => this.sourceChanged(file));
        }

        this.createRoutes();

    }

    createRoutes(router = this.router, server = this) {

        const index = fs.readFileSync(__dirname + '/../ui/index.html', 'utf8');

        router.get('/data.json', (req, res, next) => {

            const app = server.getPack();

            app.analyze().then(() => {
                const data = app.get();
                app.logFile('output', data);
                res.json(data);
                next();
            });

        });

        router.get('/data', (req, res, next) => {

            const app = server.getPack();
            app.emit('change');

            res.send('ok');
            // next();

        });

        router.get('*', function(request, response, next) {

            const app = server.getPack();
            const resources = app.resources;
            if (resources[request.url.substr(1)] || request.url === '/') {

                response.send(index);
            } else {
                next();
            }
        });
    }

    sourceChanged(file) {

        file = path.resolve(file);

        this.app.log('code changed');

        const sources = glob.sync(__dirname + '/+(src|ui)/**/*.js');
        sources.forEach(file => {
            delete require.cache[require.resolve(file)];
        });


        if (this.app) {

            this.app.dispose();
            this.app = null;
        }

        this.parser = null;
        this.config._ = null;

        const app = this.getPack();

        app.emit('change');

    }

    sendDataToClient(data, message = 'doc-changed') {

        const server = this.config.server;
        server.sockWrite(server.sockets, message, data);

    }

    getParser() {

        if (!this.parser) {
            this.parser = require('./parser');
        }

        return this.parser;
    }

    getPack() {

        if (!this.app) {

            const app = this.getParser().parse(this.config);

            app.on('change', () => {
                app.log('devServer:', 'change');

                app.analyze().then(() => {
                    const data = app.get();
                    this.sendDataToClient(data);
                });

            });

            this.app = app;
        }

        return this.app;

    }
}

DevServer.webPackConfig = {

    // historyApiFallback: {
    //     index: 'index.html',
    // },
    stats: {
        cached: false,
        cachedAssets: false,
        color: true
    },
    contentBase: [__dirname + '/..'],
    watchContentBase: false,
    inline: true,
    before(app) {

        const server = new DevServer(global.doctoolsConfig, app);
        global.doctoolsConfig.devServer = server;// = app;

    }
}

DevServer.startWebpackDevServer = function() {

    const cfg = path.join(__dirname, '..', 'ui', 'webpack.config.js');
    const wpConfig = require(cfg);
    const portfinder = require('portfinder');

    const compiler = Webpack(wpConfig);

    const devServerConfig = DevServer.webPackConfig;

    portfinder.basePort = devServerConfig.port || 8080;

    portfinder.getPort((err, port) => {

        devServerConfig.port = port;
        devServerConfig.host = devServerConfig.host || 'localhost';
        WebpackDevServer.addDevServerEntrypoints(wpConfig, devServerConfig);

        const server = new WebpackDevServer(compiler, devServerConfig);

        global.doctoolsConfig.server = server;

        server.listen(devServerConfig.port, devServerConfig.host, function(err, res) {
            if (err) {
                throw err;
            }

            console.log('server started',`http://${devServerConfig.host}:${devServerConfig.port}`);
        });
    });



}

module.exports = DevServer;