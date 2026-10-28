import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/boarding.js/" : "/",
  build: {
    outDir: "dist-docs",
  },
}));
