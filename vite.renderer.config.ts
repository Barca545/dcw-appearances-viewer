import path from "path";
import fs from "fs";
import { defineConfig } from "vite";

// TODO: Should this be in another file?
const RENDERER_DIR = path.join(__dirname, "src", "renderer");
// This grabs every html file in the render directory
function exportPages(): string[] {
  return fs
    .readdirSync(RENDERER_DIR, { encoding: "utf-8" })
    .filter((file) => path.extname(file) === ".html")
    .map((file) => {
      return path.join(RENDERER_DIR, file);
    });
}

// https://vitejs.dev/config
export default defineConfig({
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: exportPages(),
    },
  },
});
