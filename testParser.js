const fs = require('fs');
const {deIndent} = require('./util');

const cache = {};

const jsdom = require('jsdom');

const dom = false;// = new jsdom.JSDOM(fs.readFileSync('./test/test.html'), 'utf8');

module.exports = {
    getTestCodes(testFile, func) {

        const codes = {};
        if (typeof cache[testFile] === 'undefined') {
            if (fs.existsSync(testFile)) {
                cache[testFile] = fs.readFileSync(testFile, 'utf8');
            } else {
                cache[testFile] = false;
            }
        }

        if (cache[testFile]) {
            const testSource = cache[testFile];

            const regStr = /\n*?(\s*)it\('name:?([^']*)[^{]*{\n*(\s+)(.*?)\n\1}\);/.source.replace('name', func);
            const regex = new RegExp(regStr, 'sg');

            let res = null;
            do {
                res = (res = regex.exec(testSource));
                if (res) {
                    codes[res[2]] = deIndent(res[4], res[3]);
                }
            } while (res);
        }

        codes._html = dom && dom.window.document.getElementById(name);

        return codes;

    }
}