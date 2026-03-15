#!/usr/bin/env node

const { installFonts, shouldSkipFontInstall } = require("../lib/font-installer");

if (shouldSkipFontInstall(process.env)) {
  process.exit(0);
}

try {
  installFonts();
} catch (err) {
  const msg = err && err.message ? err.message : String(err);
  process.stderr.write(`[llmquota] font install skipped: ${msg}\n`);
}
