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

        let data;

        if (config.watch) {
            const watchedFiles = Package.getIncludedFiles(config);

            fs.watch(config.base, {recursive: true}, (eventType, filename) => {
                filename = path.join(config.base, filename);
                if (watchedFiles.includes(filename)) {

                    data && data.patch && data.patch(filename).then(res => {
                        config.server.sockWrite(config.server.sockets, 'doc-changed', data.serialize());
                    });

                    console.log(filename, 'changed!!');

                }
            });
        }

        app.get('/data.json', (req, res, next) => {

            if (!data || config.developMode) {

                if (config.developMode) {

                    console.log('re-parsing whole docu');

                    glob.sync(__dirname + '/src/*.js').forEach(file => {
                        delete require.cache[require.resolve(file)];
                    });

                }
                data = parser.parse(config);
            }

            console.log(app);
            console.log('serving data.json', config);

            res.json(data.serialize());

            next();
        });

    }
};