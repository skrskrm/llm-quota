const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "bin", "llmquota.js");

test("setup-fonts CLI installs both fonts into target directory", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "llmquota-setup-cli-"));
  const sourceLogos = path.join(tmpRoot, "src-logos.ttf");
  const sourceCells = path.join(tmpRoot, "src-cells.ttf");
  const targetDir = path.join(tmpRoot, "target-fonts");
  fs.writeFileSync(sourceLogos, "logos");
  fs.writeFileSync(sourceCells, "cells");

  const env = {
    ...process.env,
    LLMQUOTA_LOGOS_FONT_PATH: sourceLogos,
    CELLGAUGE_SYMBOLS_FONT_PATH: sourceCells,
  };

  const result = spawnSync(process.execPath, [CLI, "setup-fonts", "--font-dir", targetDir], {
    encoding: "utf8",
    env,
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /LLMQuotaLogos\.ttf/);
  assert.match(result.stdout, /CellGaugeSymbols\.ttf/);
  assert.equal(fs.readFileSync(path.join(targetDir, "LLMQuotaLogos.ttf"), "utf8"), "logos");
  assert.equal(fs.readFileSync(path.join(targetDir, "CellGaugeSymbols.ttf"), "utf8"), "cells");
});

test("font-paths CLI prints both source font mappings", () => {
  const result = spawnSync(process.execPath, [CLI, "font-paths"], {
    encoding: "utf8",
    env: process.env,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^LLMQuotaLogos=/m);
  assert.match(result.stdout, /^CellGaugeSymbols=/m);
});
