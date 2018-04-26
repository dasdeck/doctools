const fs = require('fs');
const {deIndent} = require('./util');

const cache = {};

const htmlPath = './test/test.html';
const htmlText = fs.existsSync(htmlPath) && fs.readFileSync(htmlPath)
const win = typeof window === 'undefined' ? (new (require('jsdom').JSDOM)(htmlText, 'utf8')).window : window;

module.exports = {
    onMap_(testFile, func) {

        const codes = {};
        if (typeof cache[testFile] === 'undefined') {
            if (fs.existsSync(testFile)) {
                cache[testFile] = fs.readFileSync(testFile, 'utf8');
            } else {
                cache[testFile] = false;
            }
        }

        const name = testFile.split('/').pop().split('.').shift();

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

        codes._html = win && win.document.getElementById(name);

        return codes;

    }
}