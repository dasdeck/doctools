# yootheme-doctools

document modern javascript projects

## install

`npm i -D github:dasdeck/doctools`

or globally

`npm i -g github:dasdeck/doctools`

## usage

inside `package.json``
```json
    "scripts": {
        "build:doc": "doctools [rootpath]"
    }
```

## config

`doctools.config.js`

```js
module.exports = {
    base: __dirname,
    search: '+(src|ui)/**/*.+(js|vue)',
    developMode: false,
    /**
     * @type
     * /
    runtime: __dirname + '/webpack.config.js'
};
```