// I want to export wrapper functions here that use the "path" type I created in "load" (which maybe should also be moved into here)

import { Path } from "core/load";

export function existsSync(path: Path) {
  throw new Error(`existsSync is not defined.`);
}

export function readFileSync(path: Path) {
  throw new Error(`readFileSync is not defined.`);
}

export function writeFileSync(path: Path) {
  throw new Error(`writeFileSync is not defined.`);
}
