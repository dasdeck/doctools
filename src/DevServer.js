/* eslint-env node */

const glob = require('glob');
const fs = require('fs');
const path = require('path');
const WebpackDevServer = require('webpack-dev-server');
const Webpack = require('webpack');

class DevServer {

    constructor(config, app) {

        this.app = app;
        this.config = config;


        if (config.dev) {

            fs.watch(__dirname, {recursive: true}, (e, file) => this.sourceChanged(file));
            // fs.watch(__dirname + '/ui', {recursive: true}, (e, file) => this.sourceChanged(file));
        }

        this.createRoutes();

    }

    createRoutes(app = this.app, server = this) {

        const index = fs.readFileSync(__dirname + '/../ui/index.html', 'utf8');

        app.get('/data.json', (req, res, next) => {

            const pack = server.getPack();

            pack.analyze().then(() => {
                pack.get().then(data => {
                    pack.logFile('output', data);
                    res.json(data);
                    next();
                });
            });

        });

        app.get('/data', (req, res, next) => {

            const pack = server.getPack();
            pack.emit('change');

            res.send('ok');
            // next();

        });

        app.get('*', function(request, response, next) {

            const pack = server.getPack();
            const resources = pack.getResources();
            if (resources[request.url.substr(1)] || request.url === '/') {

                response.send(index);
            } else {
                next();
            }
        });
    }

    sourceChanged(file) {

        file = path.resolve(file);

        console.log('code changed');

        const sources = glob.sync(__dirname + '/+(src|ui)/**/*.js');
        sources.forEach(file => {
            delete require.cache[require.resolve(file)];
        });


        if (this.pack) {

            this.pack.dispose();
            this.pack = null;
        }

        this.parser = null;
        this.config._ = null;

        const pack = this.getPack();

        pack.emit('change');

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

        if (!this.pack) {

            const pack = this.getParser().parse(this.config);

            pack.on('change', () => {
                console.log('devServer:', 'change');

                if(pack.analyzes) {
                    console.log('waiting to finish')
                    return;
                }

                pack.analyze().then(() => {
                    pack.get().then(data => {
                        this.sendDataToClient(data);
                    });
                });

            });

            this.pack = pack;
        }

        return this.pack;

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