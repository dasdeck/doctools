
// const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Plugin = require('./Plugin');

module.exports = class  extends Plugin {

    onConstruct(pack) {

        fs.watch(config.base, {recursive: true}, (eventType, filename) => {
                // debugger;
            filename = path.join(config.base, filename);

            // if (watchedFiles.includes(filename)) {

                pack.analyze().then(() => {
                    config.server.sockWrite(config.server.sockets, 'doc-changed', pack.getDataPackage());
                });

                pack && pack.patch && pack.patch(filename).then(data => {
                    config.server.sockWrite(config.server.sockets, 'doc-changed', data);
                }).catch(console.warn);

            // }
        });

    }

};