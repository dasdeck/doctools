
module.exports = {
    /**
     * normalizes indention to 0
     * @param {String} string - string to indent
     * @param {String} [origIndent = null] - the amount of space to deIndent, will get auto guessed if omitted
     * @param {String} [newIndent = ''] - the new indention to have
     */
    deIndent(string, origIndent = null, newIndent = '') {

        const lines = string.split('\n');
        if (origIndent === null) {
            [, origIndent] = /(\s*)/.exec(lines[0]);//.match()
        }
        return lines.map(line => newIndent + line.replace(origIndent, '')).join('\n');
    },

    crudeImport(script) {
        return eval(script.replace(/import/g, '//import').replace('export default', 'global.res = '));
    }
};

