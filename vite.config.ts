import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  return {
    build: {
      target: "esnext",
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-three": ["three", "@react-three/fiber", "@react-three/drei"],
            "vendor-lib": ["@tanstack/react-query", "framer-motion", "i18next", "react-i18next"],
          },
        },
      },
    },
    define: {
      "import.meta.env.VITE_FEATURE_PRATO_EDITOR": JSON.stringify("true"),
      "import.meta.env.VITE_FEATURE_PAGES_CMS": JSON.stringify("true"),
      "import.meta.env.VITE_FEATURE_VISITOR_MESSAGES": JSON.stringify("true"),
    },
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean,
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
