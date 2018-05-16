
class UIkitRunner {

    plain(code, markdown) {

        const id = 'a'
        // debugger;
        return `<div class="uikit-runner uk-position-relative uk-margin-medium">
                    <ul uk-tab>
                        <li><a href="#">Preview</a></li>
                        <li><a href="#">Markup</a></li>
                    </ul>

                    <ul class="uk-switcher uk-margin">
                        <li class="code">${code}</li>
                        <li>${markdown.renderCode(code, this.getLanguage(code), true)}</li>
                    </ul>

                    <div class="uk-position-top-right uk-margin-small-top">
                        <ul class="uk-iconnav">
                            <li><a class="copy" uk-tooltip="Copy to Clipboard" rel="#${id}"><img class="uk-icon" src="../images/icon-clipboard.svg" uk-svg></a></li>
                            <li><a class="edit" uk-tooltip="Edit on Codepen" rel="#${id}"><img class="uk-icon" src="../images/icon-flask.svg" uk-svg></a></li>
                        </ul>
                    </div>
                </div>`;

    }

    getLanguage(code) {

        return code.trim().substr(0, 1) === '<' ? 'html' : 'js';
    }

    edit(code) {

        UIkitRunner.edit(code);

    }

};

UIkitRunner.edit = code => {

    const regexp = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const scripts = (code.match(regexp) || []).join('\n').replace(/<\/?script>/g, '');

    code = code
        .replace(regexp, '')
        .replace(/<img[^>]+src="(.*?)"|url\((.*?)\)"/g, (match, src) => src.indexOf('../docs/') === 0 ? match.replace(src, `${location.href.split('/docs/')[0]}/docs/${src.replace('../docs/', '')}`) : match);

    const nc = Date.now() % 9999;

    const data = {
            title: '',
            description: '',
            html: code,
            html_pre_processor: 'none',
            css: '',
            css_pre_processor: 'none',
            css_starter: 'neither',
            css_prefix_free: false,
            js: scripts || '',
            js_pre_processor: 'none',
            js_modernizr: false,
            html_classes: '',
            css_external: `https://getuikit.com/assets/uikit/dist/css/uikit.css?nc=${nc}`,
            js_external: `https://getuikit.com/assets/uikit/dist/js/uikit.js?nc=${nc};https://getuikit.com/assets/uikit/dist/js/uikit-icons.js?nc=${nc}`
        };

    // Quotes will screw up the JSON
    const dataString = JSON.stringify(data)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const form = UIkit.util.append(document.body, `<form action="https://codepen.io/pen/define" method="POST" target="_blank">
            <input type="hidden" name="data" value='${dataString}'>
        </form>`)[0];

    form.submit();
    UIkit.util.remove(form);

};

export default UIkitRunner;