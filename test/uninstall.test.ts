import { makeUninstallScript } from "src/main/utils";

// This does not work because app.get path doesn't work here
// Need a test switch for log that doesn't try to use that bit
// need to inject an env for tests
const script = makeUninstallScript();

console.log(script);
