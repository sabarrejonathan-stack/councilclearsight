import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { applySecurityMiddleware } from "./security";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Apply comprehensive security middleware (CSP, HSTS, compression, etc.)
  applySecurityMiddleware(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // ── Daily news generation scheduler ─────────────────────────────────────
  // Generate articles on startup if none exist for today, then every 12 hours
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  async function runDailyNewsIfNeeded() {
    try {
      const { generateDailyNews } = await import("../newsGenerator");
      console.log("[Scheduler] Triggering daily news generation...");
      const result = await generateDailyNews();
      const successes = result.results.filter((r: any) => r.success).length;
      console.log(`[Scheduler] Daily news complete: ${successes}/${result.results.length} articles published`);
    } catch (err) {
      console.error("[Scheduler] Daily news generation failed:", err);
    }
  }
  // Run 30 seconds after startup to let the server stabilise
  setTimeout(runDailyNewsIfNeeded, 30_000);
  // Then repeat every 12 hours
  setInterval(runDailyNewsIfNeeded, TWELVE_HOURS);
}

startServer().catch(console.error);
