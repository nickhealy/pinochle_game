const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./index.ts",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "game.bundle.js",
  },
  performance: { hints: false },
  devServer: {
    static: "./dist",
    open: true,
    port: 3000,
    watchFiles: [
      '*.js', "*.html"
    ]
  },

  module: {
    rules: [
      {
        test: /\.ts/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
  ],
};
