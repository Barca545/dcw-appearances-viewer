const name = "DC Database Appearance Viewer";
const config = {
    appId: "dc-database.appearance-viewer",
    productName: name,
    executableName: name,
    directories: { output: "./release" },
    files: [],
    // TODO: Don't have mac, can't build for mac
    // mac: { target: "default" },
    // TODO: What fields and data do I need here
    // win: { target: "" },
    // TODO: What kind of target
    target: { target: "", arch: [] },
    // TODO: How do I control the build number
    buildNumber: "",
    // TODO: How to get/set the version? Is this related to the build number?
    buildVersion: "",
    // TODO: Need to find a basic bit of boilerplate
    copyright: "",
    forceCodeSigning: false,
    // TODO: Figure out if this is needed, I think no?
    // https://docs.npmjs.com/cli/v11/commands/npm-rebuild
    npmRebuild: false,
    // TODO: What does portable do?
    // portable: {},
    // TODO: Do I want scripts in the end?
    removePackageScripts: true,
    // TODO: Should only be maximum for release
    compression: "maximum",
    // TODO: What is this and what should it be?
    asarUnpack: "",
};
export {};
