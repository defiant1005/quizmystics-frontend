/// <reference types="vitest" />

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import eslintPlugin from "vite-plugin-eslint2";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import VueDevTools from "vite-plugin-vue-devtools";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  //@ts-ignore
  test: {
    globals: true,
    environment: "jsdom",
  },

  plugins: [
    vue(),
    eslintPlugin(),
    tsconfigPaths(),
    VueDevTools({
      componentInspector: false,
      launchEditor: "webstorm",
    }),
  ],

  server: {
    port: 8080,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".ts", ".js", ".vue"],
  },

  build: {
    target: "esnext",
    cssCodeSplit: true,
    sourcemap: true,
    outDir: path.join(__dirname, "dist"),
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData:
          '@use "@/scss/variables.scss" as *; @use "@/scss/mixins.scss" as *;',
      },
    },
  },
});
