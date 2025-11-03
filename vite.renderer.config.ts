import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  root: ".",
  build: {
    // outDir: "../../.vite/build/renderer/main_window",
    emptyOutDir: true,
  },
});
