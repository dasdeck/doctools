/* eslint-env node */

const glob = require('glob');
const fs = require('fs');

class DevServerTools {

    constructor(config) {

        this.config = config;

        if (config.dev) {

            fs.watch(__dirname+ '/src', {recursive: true}, res => {

                console.log('code changed');

                glob.sync(__dirname + '/src/**/*.js').forEach(file => {
                    delete require.cache[require.resolve(file)];
                });

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

            if (this.config.watch) {
                // pack.watch();
                pack.on('change', () => {

                    pack.analyze().then(() => {
                        this.sendDataToClient(pack.getDataPackage())
                    });

                });
            }

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
                const data = pack.getDataPackage();
                res.json(data);
                next();
            });

        });

    }
};