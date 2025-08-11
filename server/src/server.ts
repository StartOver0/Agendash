import cors from "@elysiajs/cors";
import node from "@elysiajs/node";
import staticPlugin from "@elysiajs/static";
import Elysia from "elysia";
import path from "path";
import fs from "fs";

const __dirname = path.resolve();
const publicDir = path.join(__dirname, "public");

const app = new Elysia({ adapter: node() })
  .use(
    cors({
      origin: "*", // or specific origin if needed
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  )
  // Serve all static files from /public directory
  .use(
    staticPlugin({
      assets: publicDir,
      prefix: "", // serve files directly from root
    })
  )
  // Fallback: send index.html for unmatched routes (SPA routing)
  .get("/dash", () => {
    return new Response(
      fs.readFileSync(path.join(publicDir, "index.html"), "utf-8"),
      { headers: { "Content-Type": "text/html" } }
    );
  })
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia running at http://${hostname}:${port}`)});
  /**
   * Simple check to verify static file serving:
   * Try accessing http://localhost:3000/style.css (or any CSS file in /public)
   * If the CSS loads in the browser (check Network tab), static serving works.
   * 
   * You can also add a test route:
   */
  app.get("/health", () => "OK");
