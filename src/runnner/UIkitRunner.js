
export default class UIkitRunner {

    getLanguage(code) {

        return code.trim().substr(0, 1) === '<' ? 'html' : 'js';
    }

}