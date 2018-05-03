const parser = require('../src/parser');

describe('parser', () => {

    it('test linking', function(done) {
        const pack = parser.parse({
            base: __dirname + '/../examples/packages/global-linking'
        });

        pack.analyze().then(res => {
            const doc = res.resources['Users.jms.doctools.examples.packages.global-linking.src.config.js'].module.documented;
            const doc2 = res.resources['Users.jms.doctools.examples.packages.global-linking.src.test.js'].module.documented;
            debugger;
        });
    });
});