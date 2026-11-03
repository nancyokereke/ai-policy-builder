import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    {
      name: "local-only-production-csp",
      transformIndexHtml(html) {
        return command === "build"
          ? html
              .replace("script-src 'self' 'unsafe-inline'", "script-src 'self'")
              .replace("connect-src 'self' ws: wss:", "connect-src 'self'")
          : html;
      },
    },
  ],
  server: { host: "0.0.0.0", allowedHosts: true },
  preview: { host: "0.0.0.0", allowedHosts: true },
  build: { target: "es2022" },
}));
