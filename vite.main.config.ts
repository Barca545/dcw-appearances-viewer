import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  root: ".",
  build: {
    rollupOptions: {
      external: [
        "sharp",
        // Also externalize sharp's optional dependencies
        "@img/sharp-win32-x64",
        "@img/sharp-darwin-arm64",
        "@img/sharp-darwin-x64",
        "@img/sharp-linux-x64",
        // Add other platforms as needed
      ],
    },
  },
});
