const mkpath = require('mkpath');
const fs = require('fs');
const rimraf = require('rimraf');
const path = require('path');

module.exports = {

    onWriteCache() {
        this.writeCache();
    },

    // getState() {
    //     throw 'implement'
    // },

    // setState(state) {
    //     throw 'implement'
    // },

    // getHash() {
    //     throw 'implement'
    // },

    // getChacheName() {

    //     throw 'implement'
    // },

    getCacheFile() {
        return path.join(this.getCacheDir(), this.getHash() + '.json' );
    },


    getCacheDir() {
        return path.join(this.app.getCacheDir(), this.getChacheName() );
    },

    checkCache() {
        return fs.existsSync(this.getCacheFile()) || rimraf.sync(this.getCacheDir());
    },

    writeCache() {
        mkpath.sync(this.getCacheDir());
        fs.writeFileSync(this.getCacheFile(), JSON.stringify(this.getState(), null, 2));
    },

    restoreCache() {
        const state = JSON.parse(fs.readFileSync(this.getCacheFile(), 'utf8'));
        this.setState(state);
    }
}