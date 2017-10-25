const path = require('path');

module.exports = {
  type: 'react-app',
  webpack: {
    rules: {
      sass: {
        includePaths: [path.resolve('src/styles/**')]
      }
    },
    publicPath: 'https://tacastillo.github.io/romcoms/'
  }
}
