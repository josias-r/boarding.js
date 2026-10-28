import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/lib/main.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
});
