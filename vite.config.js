import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works when served from any subpath
// (useful for GitHub Pages project sites, etc.)
export default defineConfig({
  plugins: [react()],
  base: "./",
});
