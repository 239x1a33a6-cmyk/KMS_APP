const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { once } = require("node:events");

const app = require("../app");

let server;

const uniqueEmail = () =>
  `user.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;

test.before(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/knowledgevault-tests");
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
  await mongoose.disconnect();
});

test("POST /api/auth/register creates a user without exposing a password", async () => {
  const email = uniqueEmail();
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/auth/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alice Test",
        email,
        password: "Password123",
      }),
    },
  );

  const json = await response.json();

  assert.equal(response.status, 201);
  assert.equal(json.success, true);
  assert.equal(json.data.email, email);
  assert.equal(json.data.role, "user");
  assert.ok(!("password" in json.data));
});

test("POST /api/auth/login creates a secure cookie and returns user data", async () => {
  const email = uniqueEmail();

  await fetch(`http://127.0.0.1:${server.address().port}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Bob Test",
      email,
      password: "Password123",
    }),
  });

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: "Password123",
      }),
    },
  );

  const json = await response.json();
  const setCookieHeader = response.headers.get("set-cookie") || "";

  assert.equal(response.status, 200);
  assert.equal(json.success, true);
  assert.equal(json.data.email, email);
  assert.match(setCookieHeader, /token=/i);
  assert.match(setCookieHeader, /HttpOnly/i);
});

test("GET /api/auth/me rejects unauthenticated requests", async () => {
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/auth/me`,
  );
  const json = await response.json();

  assert.equal(response.status, 401);
  assert.equal(json.success, false);
  assert.match(json.message, /Authentication|required|token/i);
});
