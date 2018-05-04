/* eslint-env node */

const glob = require('glob');
const fs = require('fs');
const path = require('path');

class DevServerTools {

    constructor(config, app) {

        this.app = app;
        this.config = config;

        if (config.dev) {

            fs.watch(__dirname + '/src', {recursive: true}, (e, file) => this.sourceChanged(file));
            fs.watch(__dirname + '/ui', {recursive: true}, (e, file) => this.sourceChanged(file));

        }

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
            this.parser = require('./src/parser');
        }

        return this.parser;
    }

    getPack() {

        if (!this.pack) {

            const pack = this.getParser().parse(global.doctoolsConfig);

            pack.on('change', () => {

                pack.analyze().then(() => {
                    pack.write().then(data => {
                        this.sendDataToClient(data);
                    });
                });

            });

            this.pack = pack;
        }

        return this.pack;

    }
}

module.exports = {

    historyApiFallback: {
        index: 'ui/index.html',
    },
    contentBase: [__dirname, 'src'],
    watchContentBase: false,
    inline: true,
    before(app) {

        const server = new DevServerTools(global.doctoolsConfig, app);
        global.doctoolsConfig.devServer = server;// = app;
        server.getPack(); //init once to register routes first

        app.get('/data.json', (req, res, next) => {

            const pack = server.getPack();

            pack.analyze().then(() => {
                pack.write().then(data => {
                    pack.logFile('output', data);
                    res.json(data);
                    next();
                });
            });

        });

        app.get('/data', (req, res, next) => {

            const pack = server.getPack();
            pack.emit('change');
            next();

        });

        app.get('*', function(request, response, next) {


            const pack = server.getPack();
            const resources = pack.getResources();
            if (resources[request.url]) {
                response.sendFile(__dirname + '/ui/index.html');
            } else {
                next();
            }
        });

    }
};