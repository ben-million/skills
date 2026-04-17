import { defineConfig } from "isolet-js";

export default defineConfig({
  name: "budge",
  entry: "./src/entry.tsx",
  format: ["iife", "esm"],
  globalName: "Budge",
  minify: true,
});
