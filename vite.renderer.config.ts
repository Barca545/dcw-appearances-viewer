import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src/renderer/index.html"),
        error: path.resolve(__dirname, "src/renderer/error.html"),
      },
    },
  },
});
