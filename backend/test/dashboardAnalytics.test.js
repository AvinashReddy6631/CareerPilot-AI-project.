const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeAnalyticsRange,
  getRangeStart,
  isValidScore,
  calculateScoreChange,
} = require("../utils/dashboardAnalytics");

test("dashboard analytics accepts supported ranges and defaults invalid input", () => {
  assert.equal(normalizeAnalyticsRange("7d"), "7d");
  assert.equal(normalizeAnalyticsRange("30d"), "30d");
  assert.equal(normalizeAnalyticsRange("all"), "all");
  assert.equal(normalizeAnalyticsRange("year"), "30d");
});

test("dashboard range starts use UTC calendar boundaries", () => {
  const now = new Date("2026-03-01T14:30:00.000Z");
  assert.equal(getRangeStart("7d", now).toISOString(), "2026-02-23T00:00:00.000Z");
  assert.equal(getRangeStart("30d", now).toISOString(), "2026-01-31T00:00:00.000Z");
  assert.equal(getRangeStart("all", now), null);
});

test("score validation rejects incomplete and malformed chart values", () => {
  assert.equal(isValidScore(7.5, 10, 0.1), true);
  assert.equal(isValidScore(0, 10, 0.1), false);
  assert.equal(isValidScore(11, 10), false);
  assert.equal(isValidScore(Number.NaN, 100), false);
  assert.equal(isValidScore("82", 100), false);
});

test("trend change compares adjacent actual points only", () => {
  assert.equal(calculateScoreChange([{ value: 71 }, { value: 78 }]), 7);
  assert.equal(calculateScoreChange([{ value: 6.3 }]), null);
  assert.equal(calculateScoreChange([]), null);
});
