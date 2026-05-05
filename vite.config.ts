import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Makes /<slug> and /<slug>/ serve public/<slug>/index.html in dev,
// instead of being swallowed by the SPA fallback.
const staticFolderRedirect = (): Plugin => ({
  name: "static-folder-redirect",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url || "/";
      if (req.method !== "GET" || url === "/" || url.includes(".")) {
        return next();
      }
      const [pathname, query = ""] = url.split("?");
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length !== 1) return next();
      const slug = segments[0];
      const candidate = path.resolve(__dirname, "public", slug, "index.html");
      if (!fs.existsSync(candidate)) return next();

      // Normalize to trailing slash for clean relative-asset resolution.
      if (!pathname.endsWith("/")) {
        res.statusCode = 308;
        res.setHeader("Location", `${pathname}/${query ? `?${query}` : ""}`);
        return res.end();
      }
      // Serve the static index.html directly.
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(fs.readFileSync(candidate));
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), staticFolderRedirect(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
