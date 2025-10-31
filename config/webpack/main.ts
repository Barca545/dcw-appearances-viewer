import builder, { Platform } from "electron-builder";
import TerserPlugin from "terser-webpack-plugin";

const options = {
  // productName: "DC Database Appearance Viewer",
  // // TODO: FIXME: No idea what this protocols thing is all about
  // protocols: { name: "", schemes: ["deeplink"] },
  target: "electron-main",
  entry: {
    main: "./target/main.js",
    preload: "./target/preload.js",
  },
  output: {
    path: "release/app/dist/main",
    filename: "[name].js",
    library: { type: "umd" },
  },
  optimization: {
    minimizer: [new TerserPlugin({ parallel: true })],
  },
  // FIXME: Not sure this config intended to make it so there is no conflict with node is useful since I am not able to use these node features anyway
  node: {
    __dirname: false,
    __filename: false,
  },
};

builder.build({
  targets: Platform.WINDOWS.createTarget(),
  config: options,
});
