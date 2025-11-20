import path from "path";
import fs from "fs";
import { defineConfig } from "vite";

const RENDERER_DIR = path.join(__dirname, "src", "renderer");
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
  // root: "src/renderer",
  build: {
    // outDir: "../../.vite/build/renderer/main_window",
    emptyOutDir: true,
    rollupOptions: {
      // This grabs every html file in the render directory
      input: exportPages(),
    },
  },
});
