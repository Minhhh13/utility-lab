import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  server: { watch: { ignored: ["**/outputs/**", "**/docs/**"] } },
  plugins: [
    react(),
    {
      name: "offline-shell-manifest",
      apply: "build",
      generateBundle(_options, bundle) {
        this.emitFile({
          type: "asset",
          fileName: "precache-manifest.json",
          source: JSON.stringify(
            Object.keys(bundle)
              .filter((name) => /\.(js|css)$/.test(name))
              .map((name) => `/${name}`),
          ),
        });
      },
    },
  ],
  build: { target: "es2020" },
});
