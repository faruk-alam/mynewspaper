#!/usr/bin/env node
/** Tiny static preview server for dist/ (no dependencies). Usage: npm run dev [-- --port=8080] */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { DIST } from './lib/utils.js';

const portArg = process.argv.find((a) => a.startsWith('--port='));
const PORT = Number(portArg?.split('=')[1]) || Number(process.env.PORT) || 8080;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

async function send(res, file, status = 200) {
  const data = await readFile(file);
  res.writeHead(status, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  res.end(data);
}

http
  .createServer(async (req, res) => {
    try {
      let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pathname.endsWith('/')) pathname += 'index.html';
      let file = path.normalize(path.join(DIST, pathname));
      if (!file.startsWith(DIST)) {
        res.writeHead(403).end();
        return;
      }
      try {
        const s = await stat(file);
        if (s.isDirectory()) {
          res.writeHead(301, { Location: `${pathname}/` }).end();
          return;
        }
      } catch {
        await send(res, path.join(DIST, '404.html'), 404);
        return;
      }
      await send(res, file);
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  })
  .listen(PORT, () => console.log(`▶ Preview: http://localhost:${PORT}/  (serving dist/ — run "npm run build" first)`));
