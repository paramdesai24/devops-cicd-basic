const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    // Port 0 tells OS to assign an available ephemeral port
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('GET /health returns status 200 and UP', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.strictEqual(response.status, 200);

  const data = await response.json();
  assert.strictEqual(data.status, 'UP');
  assert.ok(data.timestamp);
  assert.strictEqual(typeof data.uptime, 'number');
});

test('GET /ready returns status 200 and ready true', async () => {
  const response = await fetch(`${baseUrl}/ready`);
  assert.strictEqual(response.status, 200);

  const data = await response.json();
  assert.strictEqual(data.ready, true);
});

test('GET /api/info returns application metadata', async () => {
  const response = await fetch(`${baseUrl}/api/info`);
  assert.strictEqual(response.status, 200);

  const data = await response.json();
  assert.strictEqual(data.name, 'devops-cicd-basic');
  assert.strictEqual(data.version, '1.0.0');
});
