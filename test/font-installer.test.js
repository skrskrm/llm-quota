const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  defaultFontDir,
  parseSetupFontsArgs,
  installFonts,
  shouldSkipFontInstall,
} = require("../lib/font-installer");

test("defaultFontDir resolves macOS user fonts directory", () => {
  assert.equal(
    defaultFontDir({ platform: "darwin", homedir: "/Users/demo", env: {} }),
    "/Users/demo/Library/Fonts"
  );
});

test("defaultFontDir resolves Linux user fonts directory", () => {
  assert.equal(
    defaultFontDir({ platform: "linux", homedir: "/home/demo", env: {} }),
    "/home/demo/.local/share/fonts"
  );
});

test("defaultFontDir resolves Windows user fonts directory", () => {
  const got = defaultFontDir({
    platform: "win32",
    homedir: "C:\\Users\\demo",
    env: { LOCALAPPDATA: "C:\\Users\\demo\\AppData\\Local" },
  });
  assert.equal(got, "C:\\Users\\demo\\AppData\\Local\\Microsoft\\Windows\\Fonts");
});

test("parseSetupFontsArgs honors --font-dir and --help", () => {
  const explicit = parseSetupFontsArgs(["--font-dir", "/tmp/fonts"], {
    platform: "darwin",
    homedir: "/Users/demo",
    env: {},
  });
  assert.equal(explicit.help, false);
  assert.equal(explicit.fontDir, "/tmp/fonts");

  const help = parseSetupFontsArgs(["--help"], {
    platform: "darwin",
    homedir: "/Users/demo",
    env: {},
  });
  assert.equal(help.help, true);
});

test("parseSetupFontsArgs rejects unknown options", () => {
  assert.throws(
    () => parseSetupFontsArgs(["--wat"], { platform: "darwin", homedir: "/Users/demo", env: {} }),
    /unknown option/
  );
});

test("shouldSkipFontInstall reads OU_SKIP_FONT_INSTALL", () => {
  assert.equal(shouldSkipFontInstall({ OU_SKIP_FONT_INSTALL: "1" }), true);
  assert.equal(shouldSkipFontInstall({ OU_SKIP_FONT_INSTALL: "true" }), true);
  assert.equal(shouldSkipFontInstall({ OU_SKIP_FONT_INSTALL: "0" }), false);
  assert.equal(shouldSkipFontInstall({}), false);
});

test("installFonts copies both packaged fonts to target directory", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "llmquota-font-test-"));
  const targetDir = path.join(tmpRoot, "fonts-target");
  const logosSource = path.join(tmpRoot, "LLMQuotaLogos.ttf");
  const cellgaugeSource = path.join(tmpRoot, "CellGaugeSymbols.ttf");
  fs.writeFileSync(logosSource, "logos");
  fs.writeFileSync(cellgaugeSource, "cells");

  const installed = installFonts({
    fontDir: targetDir,
    platform: "darwin",
    env: {
      LLMQUOTA_LOGOS_FONT_PATH: logosSource,
      CELLGAUGE_SYMBOLS_FONT_PATH: cellgaugeSource,
    },
  });

  assert.equal(installed.length, 2);
  assert.equal(
    fs.readFileSync(path.join(targetDir, "LLMQuotaLogos.ttf"), "utf8"),
    "logos"
  );
  assert.equal(
    fs.readFileSync(path.join(targetDir, "CellGaugeSymbols.ttf"), "utf8"),
    "cells"
  );
});
