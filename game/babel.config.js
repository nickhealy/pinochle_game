module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
  plugins: ["@babel/plugin-syntax-dynamic-import", "dynamic-import-node"],
  env: {
    test: {
      presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        "@babel/preset-typescript",
      ],
      plugins: [
        "babel-plugin-transform-typescript-metadata",
        ["@babel/plugin-proposal-decorators", { legacy: true }],
        "@babel/plugin-syntax-dynamic-import",
        "dynamic-import-node",
      ],
    },
  },
};
