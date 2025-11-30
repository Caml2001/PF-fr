import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

const MAINTENANCE = true; // cambiar a false cuando termines

app.use((req, res, next) => {
  if (!MAINTENANCE) return next();

  // Si la solicitud es para activos estáticos (imágenes, css, js), permitir paso si es necesario
  // O bloquear todo. El snippet del usuario bloquea todo.
  // Pero si bloqueamos todo, el favicon o estilos externos no cargarán si estuvieran en el HTML.
  // En este HTML todo es inline, así que está bien.

  res.status(503).send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Saltopay - Mantenimiento</title>
      <style>
        :root {
          --bg-color: #ffffff;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --font-stack: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: var(--font-stack);
          background-color: var(--bg-color);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }

        .container {
          text-align: center;
          padding: 2rem;
          max-width: 420px;
          width: 90%;
          animation: slideUp 0.6s ease-out;
        }

        .logo {
          max-width: 180px;
          height: auto;
          margin-bottom: 2rem;
          display: inline-block;
        }

        h1 {
          margin: 0 0 1rem 0;
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: var(--text-primary);
        }

        p {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 1.05rem;
          margin: 0;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="https://files.saltopay.com/logo_salto.png" alt="Saltopay" class="logo" />
        <h1>Mejorando tu experiencia</h1>
        <p>Estamos realizando actualizaciones importantes en nuestra plataforma. Volveremos a estar operativos en unos momentos.</p>
      </div>
    </body>
    </html>
  `);
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5001;
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
