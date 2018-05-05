
const DocTools = require('./src/Doctools');

module.exports = {
    DoctoolsWebpack: require('./src/DocToolsWebpack'),
    parse(config) {
        const tools = new DocTools();
        return
    }
};