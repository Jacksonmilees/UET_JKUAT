import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 4173;
const HOST = '0.0.0.0';
// Check for dist (default Vite output) or public/build (Laravel Vite setup)
const distPath = join(__dirname, 'dist');
const publicBuildPath = join(__dirname, 'public', 'build');
const DIST_DIR = existsSync(distPath) ? distPath : (existsSync(publicBuildPath) ? publicBuildPath : distPath);

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveFile(filePath, res) {
  try {
    if (!existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const stats = statSync(filePath);
    if (!stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const content = readFileSync(filePath);
    const mimeType = getMimeType(filePath);
    
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': content.length,
    });
    res.end(content);
  } catch (error) {
    console.error('Error serving file:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  }
}

function getFilePath(urlPath) {
  // Remove query string
  const path = urlPath.split('?')[0];
  
  // Default to index.html for root or if file doesn't exist
  if (path === '/' || path === '') {
    return join(DIST_DIR, 'index.html');
  }

  const filePath = join(DIST_DIR, path);
  
  // If it's a directory or doesn't exist, try index.html (for SPA routing)
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    return join(DIST_DIR, 'index.html');
  }

  return filePath;
}

const server = createServer((req, res) => {
  const filePath = getFilePath(req.url);
  serveFile(filePath, res);
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  console.log(`📦 Serving files from: ${DIST_DIR}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

