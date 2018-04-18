/**
 * @file
 * HTTP transport tools
 * The following functions are to work with asynchronous tasks. They are used for executing code asynchronously.
 */
import {on} from './event';
import {Promise} from './promise';
import {assign, noop} from './lang';

/**
 * Make asynchronous calls to a specific URL and pass it some data.
 *
 * @example
 *
### Usage

```javascript
util.ajax('/api/users', { responseType: 'json' })
.then(function(xhr) {
    console.log(xhr.response);
});
```

### Result

```json
{parsed: 'json-object', with: 'some', example: 'data'}
```
 *
 * @category web
 * @param {String} url - The URL to call
 * @param {Object} [options] - Additional options passed to the ajax call
 * @param {Object} options.data - Additional data passed to the request
 * @param {String} options.method - Method to call the URL, e.g. `GET`, `POST`, `PUT`, `DELETE`
 *
 * @returns {Promise} A promise that resolves with the given payload on success and rejects on failure
 */
export function ajax(url, options) {
    return new Promise((resolve, reject) => {

        const env = assign({
            data: null,
            method: 'GET',
            headers: {},
            xhr: new XMLHttpRequest(),
            beforeSend: noop,
            responseType: ''
        }, options);

        env.beforeSend(env);

        const {xhr} = env;

        for (const prop in env) {
            if (prop in xhr) {
                try {

                    xhr[prop] = env[prop];

                } catch (e) {}
            }
        }

        xhr.open(env.method.toUpperCase(), url);

        for (const header in env.headers) {
            xhr.setRequestHeader(header, env.headers[header]);
        }

        on(xhr, 'load', () => {

            if (xhr.status === 0 || xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                resolve(xhr);
            } else {
                reject(assign(Error(xhr.statusText), {
                    xhr,
                    status: xhr.status
                }));
            }

        });

        on(xhr, 'error', () => reject(assign(Error('Network Error'), {xhr})));
        on(xhr, 'timeout', () => reject(assign(Error('Network Timeout'), {xhr})));

        xhr.send(env.data);
    });
}
/**
 * Load an image asynchronously.
 * @example
### Usage

```javascript
util.getImage('/path/to/image.jpeg')
.then(function(img) {
    console.log(img);
});
```

### Result

```html
<img src="/path/to/image.jpeg">
```
 * @param {String} src - url to an image
 * @returns {Promise.<Image, Error>} A promise resolving with an Image object
 */
export function getImage(src) {

    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onerror = reject;
        img.onload = () => resolve(img);

        img.src = src;
    });

}
