import { resolve } from "jsr:@std/path";
import { defineConfig } from "npm:vite@5";

/** @type {import('npm:vite').UserConfig} */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/main.ts"),
      name: "boarding.js",
      fileName: "main",
    },
  },
});
