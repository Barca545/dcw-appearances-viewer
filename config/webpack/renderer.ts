import builder, { Platform, Configuration } from "electron-builder";

const options: Configuration = {
  productName: "DC Database Appearance Viewer",
  // TODO: FIXME: No idea what this protocols thing is all about
  protocols: { name: "", schemes: ["deeplink"] },
};

builder.build({
  targets: Platform.WINDOWS.createTarget(),
  config: options,
});
