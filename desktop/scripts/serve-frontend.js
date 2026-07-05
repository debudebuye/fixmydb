const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const args = {};
process.argv.slice(2).forEach((arg, i, arr) => {
  if (arg.startsWith('--')) {
    const key = arg.slice(2);
    args[key] = arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true;
  }
});

const port = parseInt(args.port, 10) || 3000;
const apiUrl = args['api-url'] || 'http://localhost:5001';
const staticDir = args.dir || path.join(__dirname, '..', '..', '..', 'frontend', 'dist');

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    const parsed = url.parse(apiUrl);
    const isHttps = parsed.protocol === 'https:';
    const mod = isHttps ? https : http;
    const opt = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: parsed.host },
    };
    const proxy = mod.request(opt, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    proxy.on('error', () => { res.writeHead(502); res.end('Bad Gateway'); });
    req.pipe(proxy);
    return;
  }

  let filePath = path.join(staticDir, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath)) filePath = path.join(staticDir, 'index.html');

  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Frontend server running on http://localhost:${port}`);
});
