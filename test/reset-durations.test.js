const test = require("node:test");
const assert = require("node:assert/strict");

const { attachResetDurations } = require("../lib/reset-durations");

test("attachResetDurations adds per-reset seconds and next/all reset fields", () => {
  const nowMs = Date.parse("2026-01-01T00:00:00.000Z");
  const result = attachResetDurations(
    {
      provider: "codex",
      sessionReset: "2026-01-01T00:10:00.000Z",
      weeklyReset: "2026-01-01T01:00:00.000Z",
    },
    nowMs
  );

  assert.deepEqual(result.resetInSeconds, {
    sessionReset: 600,
    weeklyReset: 3600,
  });
  assert.equal(result.nextResetInSeconds, 600);
  assert.equal(result.allResetsInSeconds, 3600);
});

test("attachResetDurations ignores invalid reset timestamps", () => {
  const nowMs = Date.parse("2026-01-01T00:00:00.000Z");
  const result = attachResetDurations(
    {
      provider: "gemini",
      proReset: "not-a-date",
      flashReset: null,
    },
    nowMs
  );

  assert.equal(result.resetInSeconds, undefined);
  assert.equal(result.nextResetInSeconds, undefined);
  assert.equal(result.allResetsInSeconds, undefined);
});
