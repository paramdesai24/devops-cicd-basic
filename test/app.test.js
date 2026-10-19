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
  assert.strictEqual(data.service, 'ecommerce-spa-api');
});

test('GET /api/products returns product catalog', async () => {
  const response = await fetch(`${baseUrl}/api/products`);
  assert.strictEqual(response.status, 200);

  const data = await response.json();
  assert.strictEqual(data.success, true);
  assert.ok(Array.isArray(data.products));
  assert.ok(data.products.length >= 6);
});

test('GET /api/products?category=Audio filters category', async () => {
  const response = await fetch(`${baseUrl}/api/products?category=Audio`);
  assert.strictEqual(response.status, 200);

  const data = await response.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.products.every(p => p.category === 'Audio'));
});

test('GET /api/products/:id returns specific product', async () => {
  const response = await fetch(`${baseUrl}/api/products/1`);
  assert.strictEqual(response.status, 200);

  const data = await response.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.product.id, 1);
  assert.ok(data.product.name);
  assert.ok(data.product.price);
});

test('POST /api/orders rejects invalid order payloads', async () => {
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.strictEqual(response.status, 400);

  const data = await response.json();
  assert.strictEqual(data.success, false);
});

test('POST /api/orders successfully creates an order', async () => {
  const payload = {
    customer: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      address: '456 Tech Park, Austin, TX'
    },
    items: [
      { id: 1, name: 'AeroBeat Pro Wireless Headphones', qty: 1, price: 199.99 }
    ],
    totalAmount: 199.99
  };

  const response = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  assert.strictEqual(response.status, 201);

  const data = await response.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.order.orderId.startsWith('ORD-'));
  assert.strictEqual(data.order.status, 'CONFIRMED');
});
