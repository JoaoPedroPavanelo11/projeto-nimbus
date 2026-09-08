import { createServer } from "node:http";

const PORT = Number(process.env.PORT) || 3000;

const server = createServer((req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "GET" && req.url === "/") {
    res.statusCode = 200;
    res.end(JSON.stringify({ service: "nimbus-backend", status: "ok" }));
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.statusCode = 200;
    res.end(JSON.stringify({ status: "healthy", uptime: process.uptime() }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: "rota não encontrada" }));
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Porta ${PORT} já está em uso. Feche o outro processo ou troque a porta.`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`Nimbus ouvindo em http://localhost:${PORT}`);
});
