const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 4173);
const rootDirectory = path.resolve(__dirname);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function resolveRequestPath(urlPath) {
  const parsedUrl = new URL(urlPath || '/', `http://localhost:${port}`);
  const pathname = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;

  if (/%2f|%5c/i.test(pathname)) {
    throw new Error('Encoded path separators are not allowed');
  }

  const decodedPath = decodeURIComponent(pathname);
  return path.resolve(rootDirectory, `.${decodedPath}`);
}

const server = http.createServer((request, response) => {
  let filePath;

  try {
    filePath = resolveRequestPath(request.url || '/');
  } catch (error) {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }

  if (filePath !== rootDirectory && !filePath.startsWith(`${rootDirectory}${path.sep}`)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, file) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500);
      response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, {
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
    });
    response.end(file);
  });
});

server.listen(port, () => {
  console.log(`AgentiAi is available at http://localhost:${port}`);
});
