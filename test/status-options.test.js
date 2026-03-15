const test = require("node:test");
const assert = require("node:assert/strict");

const { collectSelectedProviders, resolveBarWidth } = require("../lib/status-options");

test("resolveBarWidth defaults to 5", () => {
  assert.equal(resolveBarWidth({ args: [], env: {} }), 5);
});

test("resolveBarWidth reads OU_BAR_WIDTH when CLI flag is absent", () => {
  assert.equal(resolveBarWidth({ args: [], env: { OU_BAR_WIDTH: "7" } }), 7);
});

test("resolveBarWidth supports --bar-width=VALUE", () => {
  assert.equal(resolveBarWidth({ args: ["--bar-width=4"], env: { OU_BAR_WIDTH: "9" } }), 4);
});

test("resolveBarWidth supports --bar-width VALUE", () => {
  assert.equal(resolveBarWidth({ args: ["--bar-width", "6"], env: { OU_BAR_WIDTH: "9" } }), 6);
});

test("resolveBarWidth ignores invalid values and falls back", () => {
  assert.equal(resolveBarWidth({ args: ["--bar-width=0"], env: { OU_BAR_WIDTH: "8" } }), 8);
  assert.equal(resolveBarWidth({ args: ["--bar-width", "abc"], env: {} }), 5);
});

test("resolveBarWidth uses the last CLI value when repeated", () => {
  assert.equal(
    resolveBarWidth({
      args: ["--bar-width=4", "--bar-width", "9", "--bar-width=6"],
      env: { OU_BAR_WIDTH: "3" },
    }),
    6
  );
});

test("collectSelectedProviders ignores --bar-width value tokens", () => {
  const selected = collectSelectedProviders(["--status", "--bar-width", "4", "codex", "--bar-width=7", "claude"]);
  assert.deepEqual(selected, ["codex", "claude"]);
});
