
module.exports = class UIkitRunner {

    constructor() {

        const uikit = document.createElement('script');
        uikit.src = 'https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-beta.42/js/uikit.min.js';
        const icons = document.createElement('script');
        icons.src = 'https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-beta.42/js/uikit-icons.js';
        const css = document.createElement('link');
        css.href = 'https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-beta.42/css/uikit.min.css';
        css.rel = 'stylesheet';

        document.head.append(uikit);
        document.head.append(icons);
        document.head.append(css);

    }

    getLanguage(code) {

        return code.trim().substr(0, 1) === '<' ? 'html' : 'js';
    }
    
}