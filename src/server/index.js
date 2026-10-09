import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHtmlMetadata, fetchUrlMetadata } from '../core/parser.js';
import { auditMetadata } from '../core/auditor.js';
import { generateAllFormats } from '../core/generator.js';
import { PRESETS, getPreset } from '../core/presets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WEB_ROOT = join(__dirname, 'web');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

/**
 * Creates and starts the MetaCraft HTTP server.
 * @param {object} [options]
 * @param {number} [options.port=3018]
 * @param {string} [options.host='0.0.0.0']
 * @returns {Promise<{ server: import('node:http').Server, port: number, url: string, close: () => Promise<void> }>}
 */
export function startServer(options = {}) {
  const port = options.port || Number(process.env.PORT) || 3018;
  const host = options.host || '0.0.0.0';

  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const pathname = reqUrl.pathname;

      try {
        // API Routes
        if (pathname === '/api/health') {
          return sendJson(res, 200, {
            status: 'ok',
            name: 'meta-craft',
            version: '1.0.0',
            port,
            uptime: process.uptime()
          });
        }

        if (pathname === '/api/presets' && req.method === 'GET') {
          return sendJson(res, 200, { presets: PRESETS });
        }

        if (pathname.startsWith('/api/presets/') && req.method === 'GET') {
          const id = pathname.replace('/api/presets/', '');
          const preset = getPreset(id);
          return sendJson(res, 200, { preset });
        }

        if (pathname === '/api/audit' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          const meta = body.meta || body;
          const audit = auditMetadata(meta);
          return sendJson(res, 200, { audit });
        }

        if (pathname === '/api/generate' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          const meta = body.meta || body;
          const formats = generateAllFormats(meta);
          return sendJson(res, 200, { formats });
        }

        if (pathname === '/api/inspect' && (req.method === 'GET' || req.method === 'POST')) {
          let targetUrl = reqUrl.searchParams.get('url');
          if (!targetUrl && req.method === 'POST') {
            const body = await parseJsonBody(req);
            targetUrl = body.url;
          }

          if (!targetUrl) {
            return sendJson(res, 400, { error: 'Missing required "url" parameter.' });
          }

          try {
            const metadata = await fetchUrlMetadata(targetUrl);
            const audit = auditMetadata(metadata);
            const formats = generateAllFormats(metadata);
            return sendJson(res, 200, {
              success: true,
              url: targetUrl,
              metadata,
              audit,
              formats
            });
          } catch (err) {
            return sendJson(res, 422, {
              success: false,
              url: targetUrl,
              error: err.message || 'Failed to fetch and parse URL metadata'
            });
          }
        }

        // Static files (Web Studio)
        let filePath = pathname === '/' ? join(WEB_ROOT, 'index.html') : join(WEB_ROOT, pathname);
        const ext = extname(filePath);

        // Security check: prevent directory traversal
        if (!filePath.startsWith(WEB_ROOT)) {
          res.writeHead(403);
          res.end('Access Denied');
          return;
        }

        try {
          const content = await readFile(filePath);
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        } catch {
          // Fallback to index.html for SPA if not found
          try {
            const indexContent = await readFile(join(WEB_ROOT, 'index.html'));
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(indexContent);
          } catch (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
          }
        }
      } catch (err) {
        console.error('Server error:', err);
        sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
      }
    });

    server.listen(port, host, () => {
      const actualPort = server.address().port;
      const url = `http://localhost:${actualPort}`;
      resolve({
        server,
        port: actualPort,
        url,
        close: () => new Promise(res => server.close(res))
      });
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}
