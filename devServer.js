/* eslint-env node */

const glob = require('glob');
const fs = require('fs');
const path = require('path');

class DevServerTools {

    constructor(config) {

        this.config = config;

        if (config.dev) {

            fs.watch(__dirname, {recursive: true}, (e, file) => {

                file = path.resolve(file);

                if (! ['/src/', '/ui/'].some(name => file.includes(name))) {
                    // debugger;
                    return;
                }
                console.log('code changed');

                const sources = glob.sync(__dirname + '/+(src|ui)/**/*.js');
                sources.forEach(file => {
                    delete require.cache[require.resolve(file)];
                });

                this.pack.dispose();

                this.pack = null;
                this.parser = null;
                this.config._ = null;

                this.getPack();

            });

        }

    }

    sendDataToClient(data) {

        const server = this.config.server;
        server.sockWrite(server.sockets, 'doc-changed', data);

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
                        this.sendDataToClient(data)
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
    inline: false,
    before(app) {

        const server = new DevServerTools(global.doctoolsConfig);

        app.get('/data.json', (req, res, next) => {

            const pack = server.getPack();

            pack.analyze().then(() => {
                pack.write().then(data => {
                    res.json(data);
                    next();
                });
            });

        });

    }
};