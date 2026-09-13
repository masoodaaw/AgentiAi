const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createServer } = require('./server.js');

function request(server, path) {
  const address = server.address();

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: address.port,
        path,
        method: 'GET',
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
          });
        });
      },
    );

    req.on('error', reject);
    req.end();
  });
}

async function withServer(run) {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    await run(server);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

test('serves the root document as html', async () => {
  await withServer(async (server) => {
    const response = await request(server, '/');

    assert.equal(response.statusCode, 200);
    assert.match(response.headers['content-type'], /text\/html/);
    assert.match(response.body, /<title>AgentiAi \| Learn, Build, Deploy Agentic AI<\/title>/);
  });
});

test('serves known static file extensions with expected content type', async () => {
  await withServer(async (server) => {
    const response = await request(server, '/script.js');

    assert.equal(response.statusCode, 200);
    assert.match(response.headers['content-type'], /text\/javascript/);
    assert.match(response.body, /const focusContent =/);
  });
});

test('rejects encoded traversal-style paths and malformed urls', async () => {
  await withServer(async (server) => {
    const encodedSeparator = await request(server, '/%2Fetc%2Fpasswd');
    const malformedUrl = await request(server, '/%E0%A4%A');

    assert.equal(encodedSeparator.statusCode, 400);
    assert.equal(malformedUrl.statusCode, 400);
  });
});
