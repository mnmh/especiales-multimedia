const HtmlWebPackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require("path");
const webpack = require("webpack");


module.exports = {
  //entry: ["./src/js/player.js", "./app.js", "./src/js/menu.js", "./src/_scss/main.scss"],
  entry: {
    app: './app.js',
    style_main: ["./src/_scss/main.scss"],
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "./build")
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [{ loader: "html-loader", options: { minimize: true } }]
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: "css-loader",
              options: { minimize: true }
            },
            { loader: "postcss-loader" },
            { loader: "sass-loader" }
          ]
        })
      }
    ],
    loaders: [
      {test: /\.ejs$/, loader: 'ejs-compiled?htmlmin'} // enable here
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "ejs-compiled-loader!./src/index.ejs",
      filename: "./index.html"
    }),
    new ExtractTextPlugin({
      filename: "css/main.css"
    }),
    new CopyWebpackPlugin([
      {from: './src/audios', to: './audios'},
      {from: './src/historias', to: './historias'},
      {from: './src/lineas', to: './lineas'},
      {from: './src/datos', to: './datos'},
      {from: './src/galerias', to: './galerias'}
    ]),
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true
    })
  ],
  devServer: {
    contentBase: "./build"
  }
};