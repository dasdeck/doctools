/* eslint-env node */

const glob = require('glob');
// const util = require('./src/util');

module.exports = {

    historyApiFallback: {
        index: 'ui/index.html',
    },
    contentBase: [__dirname, 'src'],
    watchContentBase: false,
    inline: false,
    before(app) {

        console.log('building docs...');

        const parser = require(__dirname + '/src/parser');
        const config = global.doctoolsConfig;

        let pack = parser.parse(config);

        if (config.watch) {
            // pack.watch();
            pack.on('change', () => {

                pack.analyze().then(() => {
                    config.server.sockWrite(config.server.sockets, 'doc-changed', pack.getDataPackage());
                });

            });
        }

        app.get('/data.json', (req, res, next) => {

            if (!pack || config.developMode) {

                if (config.developMode) {

                    console.log('re-parsing whole docu');

                    glob.sync(__dirname + '/src/*.js').forEach(file => {
                        delete require.cache[require.resolve(file)];
                    });

                }
                pack = parser.parse(config);
            }

            pack.analyze().then(() => {
                const data = pack.getDataPackage();
                res.json(data);
                next();
            }).catch(console.warn);

        });

    }
};