
const DocTools = require('./src/DocTools');

module.exports = {
    DocTools,
    Config: require('./src/Config'),
    HTMLExporter: require('./src/plugins/HTMLExporter'),
    DoctoolsWebpack: require('./src/DocToolsWebpack'),
    parse(config) {
        const tools = new DocTools();
        return rools;
    }
};