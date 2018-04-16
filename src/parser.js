module.exports = {

    parse(file) {
        const extension = file.split('.').pop();
        if (extension === 'vue') {
            const componentParser = require('./componentParser');
            return {type: 'component', file, ...componentParser.analyzeComponent(file)}
        } else if (extension === 'js') {
            const moduleParser = require('./moduleParser');
            return {type: 'module', file, ...moduleParser.analyzeModule(file)};
        } else {
            const packageParser = require('./packageParser')
            return {type: 'package', ...packageParser.analyzePackage(file)};
        }
    }
}