import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import healthHandler from '../api/health.ts';
import preparationItemsHandler from '../api/preparation-items.ts';
import preparationSummaryHandler from '../api/preparation-summary.ts';

const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 4173);
const distDirectoryPath = fileURLToPath(new URL('../dist', import.meta.url));
const apiHandlers = new Map([
  ['/api/health', healthHandler],
  ['/api/preparation-items', preparationItemsHandler],
  ['/api/preparation-summary', preparationSummaryHandler]
]);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

await stat(distDirectoryPath);

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${host}:${port}`);
  const handler = apiHandlers.get(requestUrl.pathname);

  if (handler) {
    await handler(request, response);
    return;
  }

  if (requestUrl.pathname.startsWith('/api/')) {
    response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'API ruta ne postoji.' } }));
    return;
  }

  await serveStaticFile(requestUrl.pathname, response);
});

server.on('error', (error) => {
  console.error(`serve: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, host, () => console.log(`Week 2 server: http://${host}:${port}`));

async function serveStaticFile(pathname, response) {
  const relativePath = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const resolvedPath = normalize(join(distDirectoryPath, relativePath));
  const isInsideDist = resolvedPath === distDirectoryPath || resolvedPath.startsWith(`${distDirectoryPath}${sep}`);

  if (!isInsideDist) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  try {
    const content = await readFile(resolvedPath);
    response.writeHead(200, { 'Content-Type': contentTypes[extname(resolvedPath)] ?? 'application/octet-stream' });
    response.end(content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}
