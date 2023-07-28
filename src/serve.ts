import express from "express";

export async function serve(dir: string, options: Record<string, string | boolean>) {
  const app = express();

  app.use((req, res, next) => {
    const originalUrl = req.url;

    if (req.url.endsWith("/")) {
      req.url = req.url.substring(0, req.url.length - 1);
    }

    if (req.url.length === 0) {
      req.url = "index.html";
    }

    if (req.url.indexOf(".") === -1) {
      req.url += ".html";
    }

    console.log(`Rewrote ${originalUrl} => ${req.url}`);

    next();
  });

  app.use(express.static(dir));

  app.listen(options.port, () => {
    console.log(`Listening on http://localhost:${options.port}`);
  });
}
