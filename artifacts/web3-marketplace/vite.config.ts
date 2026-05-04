import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";
const isVercel = !!process.env.VERCEL;

// Only require PORT and BASE_PATH in non-production / non-Vercel environments
const rawPort = process.env.PORT;
const basePath = process.env.BASE_PATH ?? "/";

if (!isProduction && !isVercel) {
  if (!rawPort) {
    throw new Error("PORT environment variable is required but was not provided.");
  }
  if (!basePath) {
    throw new Error("BASE_PATH environment variable is required but was not provided.");
  }
}

const port = rawPort ? Number(rawPort) : 3000;

const plugins: any[] = [react(), tailwindcss()];

if (!isProduction && !isVercel) {
  const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
  plugins.push(runtimeErrorOverlay());

  if (process.env.REPL_ID !== undefined) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer({ root: path.resolve(import.meta.dirname, "..") }));
    const { devBanner } = await import("@replit/vite-plugin-dev-banner");
    plugins.push(devBanner());
  }
}

export default defineConfig({
  base: basePath,
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: { strict: true },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
