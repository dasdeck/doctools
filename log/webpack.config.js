module.exports = {
  "context": "/Users/jms/doctools/examples",
  "entry": {
    "index": "./index.js"
  },
  "target": "node",
  "output": {
    "libraryTarget": "commonjs"
  },
  "mode": "development",
  "plugins": [
    {
      "config": {
        "path": "/Users/jms/doctools/docs.json"
      },
      "pack": {},
      "initial": true
    }
  ],
  "externals": {
    "vue": "Vue",
    "uikit": "UIkit"
  },
  "module": {
    "rules": [
      {
        "test": {},
        "use": {
          "loader": "vue-loader"
        }
      },
      {
        "test": {},
        "use": {
          "loader": "babel-loader"
        }
      }
    ]
  }
}