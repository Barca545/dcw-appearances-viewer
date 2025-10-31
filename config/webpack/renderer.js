import builder, { Platform } from "electron-builder";
const options = {
    productName: "DC Database Appearance Viewer",
    // TODO: FIXME: No idea what this protocols thing is all about
    protocols: { name: "", schemes: ["deeplink"] },
};
builder.build({
    targets: Platform.WINDOWS.createTarget(),
    config: options,
});
