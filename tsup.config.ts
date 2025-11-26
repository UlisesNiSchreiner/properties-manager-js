import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  format: ["esm", "cjs"],
  target: "es2022",
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
});
