import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Redirects /<slug> -> /<slug>/ in dev when public/<slug>/index.html exists,
// so static profile folders are served instead of being swallowed by the SPA fallback.
const staticFolderRedirect = (): Plugin => ({
  name: "static-folder-redirect",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url || "/";
      if (req.method !== "GET" || url.includes(".") || url === "/" || url.endsWith("/")) {
        return next();
      }
      const [pathname, query = ""] = url.split("?");
      const slug = pathname.slice(1).split("/")[0];
      if (!slug) return next();
      const candidate = path.resolve(__dirname, "public", slug, "index.html");
      if (fs.existsSync(candidate)) {
        res.statusCode = 308;
        res.setHeader("Location", `${pathname}/${query ? `?${query}` : ""}`);
        return res.end();
      }
      next();
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
