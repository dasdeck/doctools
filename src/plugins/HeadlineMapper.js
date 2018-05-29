
const _ = require('lodash');

const Plugin = require('../Plugin');

module.exports = class HeadlineMapper extends Plugin {

    onGet(app, data) {

        _.forEach(data.resources, desc => {

            if (desc.type === 'markdown') {
                // debugger;
                const regex = /^## (.*)$/gm;
                let res;
                const headlines = [];
                while (res = regex.exec(desc.readme)) {
                    headlines.push(res[1]);
                }

                desc.headlines = headlines;
            }
        })

    }

};