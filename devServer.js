/* eslint-env node */
const Package = require('./src/Package');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const glob = require('glob');

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

        let pack;

        if (config.watch) {
            const watchedFiles = Package.getIncludedFiles(config);

            fs.watch(config.base, {recursive: true}, (eventType, filename) => {
                filename = path.join(config.base, filename);
                if (watchedFiles.includes(filename)) {

                    pack && pack.patch && pack.patch(filename).then(res => {
                        config.server.sockWrite(config.server.sockets, 'doc-changed', pack.serialize());
                    }).catch(console.warn);

                    console.log(filename, 'changed!!');

                }
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