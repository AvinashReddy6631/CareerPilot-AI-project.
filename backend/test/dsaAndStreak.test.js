const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DSA_TOPICS,
  isSafeResourceUrl,
  getTotalConfiguredResources,
} = require("../config/dsaTopics");
const {
  getUtcDateKey,
  previousUtcDateKey,
  calculateStreakUpdate,
} = require("../utils/streak");

test("DSA configuration has the full unique 20-topic syllabus", () => {
  assert.equal(DSA_TOPICS.length, 20);
  assert.equal(new Set(DSA_TOPICS.map((topic) => topic.id)).size, 20);
  assert.ok(getTotalConfiguredResources() >= 40);
});

test("resource URLs accept only credential-free HTTP(S) destinations", () => {
  assert.equal(isSafeResourceUrl("https://leetcode.com/problemset/"), true);
  assert.equal(isSafeResourceUrl("http://example.com/resource"), true);
  assert.equal(isSafeResourceUrl("javascript:alert(1)"), false);
  assert.equal(isSafeResourceUrl("data:text/html,hello"), false);
  assert.equal(isSafeResourceUrl("https://user:pass@example.com"), false);
});

test("UTC date helpers handle month, year, and leap-year boundaries", () => {
  assert.equal(getUtcDateKey(new Date("2024-02-29T23:59:00.000Z")), "2024-02-29");
  assert.equal(previousUtcDateKey("2024-03-01"), "2024-02-29");
  assert.equal(previousUtcDateKey("2025-01-01"), "2024-12-31");
});

test("streak calculation is idempotent and preserves the longest streak", () => {
  const firstDay = calculateStreakUpdate(null, "2026-10-16");
  assert.deepEqual(firstDay, {
    changed: true,
    currentStreak: 1,
    longestStreak: 1,
    lastActivityDate: "2026-10-16",
  });

  const sameDay = calculateStreakUpdate(firstDay, "2026-10-16");
  assert.equal(sameDay.changed, false);
  assert.equal(sameDay.currentStreak, 1);

  const consecutiveDay = calculateStreakUpdate(firstDay, "2026-10-17");
  assert.equal(consecutiveDay.currentStreak, 2);
  assert.equal(consecutiveDay.longestStreak, 2);

  const afterGap = calculateStreakUpdate(consecutiveDay, "2026-10-19");
  assert.equal(afterGap.currentStreak, 1);
  assert.equal(afterGap.longestStreak, 2);
});
