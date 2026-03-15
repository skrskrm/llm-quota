const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const PKG_PATH = path.join(ROOT, "package.json");
const BIN_PATH = path.join(ROOT, "bin", "llmquota.js");

function readPackageJson() {
  assert.equal(fs.existsSync(PKG_PATH), true, "package.json should exist");
  return JSON.parse(fs.readFileSync(PKG_PATH, "utf8"));
}

test("package metadata is defined for llmquota", () => {
  const pkg = readPackageJson();
  assert.equal(pkg.name, "llmquota");
  assert.equal(pkg.type, "commonjs");
  assert.ok(pkg.bin && typeof pkg.bin === "object");
  assert.equal(pkg.bin.llmquota, "bin/llmquota.js");
  assert.ok(Array.isArray(pkg.files));
  assert.ok(pkg.files.includes("fonts"));
  assert.ok(pkg.files.includes("scripts"));
});

test("llmquota CLI entrypoint exists and has a shebang", () => {
  assert.equal(fs.existsSync(BIN_PATH), true, "bin/llmquota.js should exist");
  const content = fs.readFileSync(BIN_PATH, "utf8");
  assert.match(content.split("\n")[0], /^#!\/usr\/bin\/env node$/);
});
