import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
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

          if (
            id.includes("react-router-dom") ||
            id.includes("/react/") ||
            id.includes("/react-dom/")
          ) {
            return "react-vendor";
          }

          if (id.includes("@supabase/supabase-js")) {
            return "supabase-vendor";
          }

          if (id.includes("qrcode.react")) {
            return "qr-vendor";
          }

          if (id.includes("@hello-pangea/dnd")) {
            return "dnd-vendor";
          }
        },
      },
    },
  },
});
