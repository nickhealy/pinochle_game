const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./index.ts",
  mode: "development",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "game.bundle.js",
  },
  performance: { hints: false },
  devServer: {
    static: "./dist",
    open: true,
    port: 3000,
    watchFiles: ["*.ts", "*.js", "*.html"],
  },

  resolve: {
    extensions: [".js", ".ts"],
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
