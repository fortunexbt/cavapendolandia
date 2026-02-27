import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("three/examples")) return "three-examples";
          if (id.includes("three")) return "three-core";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("react-router") || id.includes("react-dom") || id.includes("react/")) {
            return "react-stack";
          }
          if (id.includes("@supabase")) return "supabase";
          return "vendor";
        },
      },
    },
  },
}));
