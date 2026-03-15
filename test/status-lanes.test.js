const test = require("node:test");
const assert = require("node:assert/strict");

const { stackedLaneValues } = require("../lib/status-lanes");

test("claude stacked lanes use primary 5h session then secondary 7d", () => {
  const lanes = stackedLaneValues({
    provider: "claude",
    session: 33,
    weekly: 72,
  });
  assert.deepEqual(lanes, { top: 33, bottom: 72 });
});

test("gemini stacked lanes remain pro then flash", () => {
  const lanes = stackedLaneValues({
    provider: "gemini",
    proUsed: 48,
    flashUsed: 60,
  });
  assert.deepEqual(lanes, { top: 48, bottom: 60 });
});

test("deepseek stacked lanes show granted and topped-up as pct of total", () => {
  const lanes = stackedLaneValues({
    provider: "deepseek",
    totalBalance: 100,
    grantedBalance: 10,
    toppedUpBalance: 90,
  });
  assert.deepEqual(lanes, { top: 10, bottom: 90 });
});

test("deepseek stacked lanes return null when total is zero", () => {
  const lanes = stackedLaneValues({
    provider: "deepseek",
    totalBalance: 0,
    grantedBalance: 0,
    toppedUpBalance: 0,
  });
  assert.deepEqual(lanes, { top: null, bottom: null });
});
