/* eslint-env node */
const Package = require('./src/Package');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
// const util = require('./src/util');

module.exports = {

    historyApiFallback: {
        index: 'ui/index.html',
    },
    contentBase: [__dirname, 'src'],
    watchContentBase: true,
    inline: true,
    before(app) {

        console.log('building docs...');

        const parser = require(__dirname + '/src/parser');
        const config = parser.prepareConfig(global.doctoolsConfig);

        let pack = parser.parse(config);

        //additionally watch add an remove of files
        if (config.watch) {

            const watchedFiles = Package.getIncludedFiles(config);

            // util.watchPack(config, pack);

            fs.watch(config.base, {recursive: true}, (eventType, filename) => {

                // debugger;
                filename = path.join(config.base, filename);
                if (watchedFiles.includes(filename)) {

                    pack && pack.patch && pack.patch(filename).then(data => {
                        config.server.sockWrite(config.server.sockets, 'doc-changed', data);
                    }).catch(console.warn);

                    // console.log(filename, 'changed!!');

                }
            });
        }

        pack.on('change', () => {

            pack.analyze().then(() => {
                config.server.sockWrite(config.server.sockets, 'doc-changed', pack.serialize());
            });

        });

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

            // console.log(app);
            // console.log('serving data.json', config);

            pack.analyze().then(() => {
                const data = pack.serialize();
                res.json(data);
                next();
            }).catch(console.warn);

        });

    }
};