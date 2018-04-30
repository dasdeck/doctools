
module.exports = class UIkitRunner {

    constructor() {

        const uikit = document.createElement('script');
        uikit.src = 'https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-beta.42/js/uikit.min.js';
        const icons = document.createElement('script');
        icons.src = 'https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-beta.42/js/uikit-icons.js';
        const css = document.createElement('link');
        css.href = 'https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-beta.42/css/uikit.min.css';
        css.res = 'stylesheet';

        document.head.append(uikit);
        document.head.append(icons);
        document.head.append(css);

    }

    run(code) {
        const id = Math.random() * 1000;

        return `<div class="uk-position-relative uk-margin-medium">
                    <ul uk-tab>
                        <li><a href="#">Preview</a></li>
                        <li><a href="#">Markup</a></li>
                    </ul>

                    <ul class="uk-switcher uk-margin">
                        <li>${code}</li>
                        <li><pre><code id="${id}" class="lang-html">${escape(code)}</code></pre></li>
                    </ul>

                    <div class="uk-position-top-right uk-margin-small-top">
                        <ul class="uk-iconnav">
                            <li><a class="js-copy" title="Copy to Clipboard" uk-tooltip rel="#${id}"><img class="uk-icon" src="../images/icon-clipboard.svg" uk-svg></a></li>
                            <li><a class="js-codepen" title="Edit on Codepen" uk-tooltip rel="#${id}"><img class="uk-icon" src="../images/icon-flask.svg" uk-svg></a></li>
                        </ul>
                    </div>
                </div>`
    }
}