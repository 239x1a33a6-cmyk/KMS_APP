const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeAccessRequestDecision,
} = require("../services/accessRequestService");

test("normalizeAccessRequestDecision accepts valid statuses", () => {
  assert.equal(normalizeAccessRequestDecision("approved"), "APPROVED");
  assert.equal(normalizeAccessRequestDecision("rejected"), "REJECTED");
});

test("normalizeAccessRequestDecision defaults invalid values to pending", () => {
  assert.equal(normalizeAccessRequestDecision("maybe"), "PENDING");
  assert.equal(normalizeAccessRequestDecision(undefined), "PENDING");
});
