import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";

export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [remarkGfm],
      mdExtensions: [".md"],
      mdxExtensions: [".mdx"],
    }),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.indexOf("node_modules") === -1) {
            return undefined;
          }

          if (id.indexOf("@xyflow") !== -1) {
            return "flow-vendor";
          }

          if (
            id.indexOf("@remix-run") !== -1 ||
            id.indexOf("react-router-dom") !== -1 ||
            id.indexOf("react-router") !== -1 ||
            id.indexOf("react-dom") !== -1 ||
            id.indexOf("scheduler") !== -1 ||
            id.match(/[\\/]node_modules[\\/]react[\\/]/)
          ) {
            return "react-vendor";
          }

          return "vendor";
        },
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
});
