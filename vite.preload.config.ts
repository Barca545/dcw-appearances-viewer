import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  root: ".",
  build: {
    // lib: {
    //   entry: "src/preload/preload.ts",
    //   formats: ["cjs"],
    // },
    // outDir: ".vite/build/src/preload",
    emptyOutDir: true,
  },
});
