const { override, addWebpackPlugin } = require('react-app-rewired');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

module.exports = override(
  addWebpackPlugin(
    new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    })
  )
);