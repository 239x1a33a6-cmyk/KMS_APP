const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { once } = require("node:events");

const app = require("../app");

let server;

const uniqueEmail = (prefix = "user") =>
  `${prefix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;

const register = async (name, email, password) => {
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/auth/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    },
  );

  return response;
};

const login = async (email, password) => {
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  );

  const setCookieHeader = response.headers.get("set-cookie") || "";
  return { response, cookie: setCookieHeader.split(";")[0] };
};

const createResource = async (cookie, payload) => {
  return fetch(`http://127.0.0.1:${server.address().port}/api/resources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(payload),
  });
};

test.before(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/knowledgevault-tests");
  await mongoose.connection.db.dropDatabase();
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
  await mongoose.disconnect();
});

test("User can create, list, update, and delete a resource with ownership enforced", async () => {
  const userAEmail = uniqueEmail("alice");
  const userBEmail = uniqueEmail("bob");

  await register("Alice User", userAEmail, "Password123");
  await register("Bob User", userBEmail, "Password123");

  const { cookie: cookieA } = await login(userAEmail, "Password123");
  const { cookie: cookieB } = await login(userBEmail, "Password123");

  const createResponse = await createResource(cookieA, {
    title: "Node Basics",
    description: "A quick note for Node",
    content: "Node is a JavaScript runtime",
    type: "NOTE",
    category: "Backend",
    tags: ["node", "javascript"],
    visibility: "PRIVATE",
  });

  const created = await createResponse.json();
  assert.equal(createResponse.status, 201);
  assert.equal(created.success, true);
  assert.equal(created.data.title, "Node Basics");

  const listResponse = await fetch(
    `http://127.0.0.1:${server.address().port}/api/resources`,
    {
      headers: { Cookie: cookieA },
    },
  );
  const listJson = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.equal(listJson.success, true);
  assert.ok(listJson.data.length >= 1);

  const updateResponse = await fetch(
    `http://127.0.0.1:${server.address().port}/api/resources/${created.data._id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieA,
      },
      body: JSON.stringify({ title: "Updated Node Basics" }),
    },
  );

  const updated = await updateResponse.json();
  assert.equal(updateResponse.status, 200);
  assert.equal(updated.data.title, "Updated Node Basics");

  // attempt to access user B resource as user A
  const otherUserResourceResponse = await fetch(
    `http://127.0.0.1:${server.address().port}/api/resources`,
    {
      headers: { Cookie: cookieB },
    },
  );
  const otherUserList = await otherUserResourceResponse.json();
  assert.equal(otherUserResourceResponse.status, 200);
  assert.equal(otherUserList.success, true);

  const blockedResponse = await fetch(
    `http://127.0.0.1:${server.address().port}/api/resources/${created.data._id}`,
    {
      headers: { Cookie: cookieB },
    },
  );
  const blocked = await blockedResponse.json();
  assert.equal(blockedResponse.status, 404);
  assert.equal(blocked.success, false);

  const deleteResponse = await fetch(
    `http://127.0.0.1:${server.address().port}/api/resources/${created.data._id}`,
    {
      method: "DELETE",
      headers: { Cookie: cookieA },
    },
  );

  const deleted = await deleteResponse.json();
  assert.equal(deleteResponse.status, 200);
  assert.equal(deleted.data.isDeleted, true);
});
