
module.exports = {

  configureWebpack(config, isServer) {

  },

  "title": "showcase examples",
  "editLinks": false,
  "themeConfig": {
    "repo": "dasdeck/doctools",
    "nav": [
      { text: 'Examples', link: '/examples/' },
    ],
    "sidebar": {
      '/examples/': require('../examples/sidebar.json')
    }
  }
}