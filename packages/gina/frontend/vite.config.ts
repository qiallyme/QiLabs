// frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // Main Lina app
        main: resolve(__dirname, "index.html"),
        // Iframe widget page
        widget: resolve(__dirname, "lina-widget.html")
      }
    }
  }
});
