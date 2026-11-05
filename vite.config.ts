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
        // Every file of a library goes into its chunk (a list of entry names left some React files in the main
        // chunk, so react-dom could run before React and the page stayed blank once pages were loaded on demand).
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|@remix-run[\\/]router|scheduler)[\\/]/.test(id)) return "vendor";
          if (/[\\/]node_modules[\\/](firebase|@firebase)[\\/]/.test(id)) return "firebase";
          if (/[\\/]node_modules[\\/](lucide-react|recharts)[\\/]/.test(id)) return "ui";
          return undefined;
        },
      },
    },
  },
}));
