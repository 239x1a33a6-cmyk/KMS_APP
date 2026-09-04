const assert = require("node:assert/strict");
const test = require("node:test");

const { buildDemoData } = require("../scripts/seedDemo");

test("buildDemoData returns seeded demo users and resources", () => {
  const data = buildDemoData();

  assert.equal(data.users.length >= 2, true);
  assert.equal(data.resources.length >= 3, true);
  assert.equal(data.users[0].email, "demo@knowledgevault.app");
  assert.equal(data.resources[0].title.length > 0, true);
});
