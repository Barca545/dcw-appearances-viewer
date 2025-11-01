import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  root: ".",
  build: {
    // outDir: "target/src/preload",
    emptyOutDir: true,
  },
});
