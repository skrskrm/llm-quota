const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function envToBool(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return null;
}

function shouldSkipFontInstall(env = process.env) {
  return envToBool(env.OU_SKIP_FONT_INSTALL) === true;
}

function defaultFontDir({ platform = process.platform, homedir = os.homedir(), env = process.env } = {}) {
  if (platform === "darwin") {
    return path.join(homedir, "Library", "Fonts");
  }
  if (platform === "linux") {
    return path.join(homedir, ".local", "share", "fonts");
  }
  if (platform === "win32") {
    const localAppData = env.LOCALAPPDATA || path.win32.join(homedir, "AppData", "Local");
    return path.win32.join(localAppData, "Microsoft", "Windows", "Fonts");
  }
  return null;
}

function parseSetupFontsArgs(argv, { platform = process.platform, homedir = os.homedir(), env = process.env } = {}) {
  const out = {
    help: false,
    fontDir: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      out.help = true;
      continue;
    }
    if (arg.startsWith("--font-dir=")) {
      out.fontDir = arg.slice("--font-dir=".length);
      continue;
    }
    if (arg === "--font-dir" && i + 1 < argv.length) {
      out.fontDir = argv[i + 1];
      i += 1;
      continue;
    }
    throw new Error(`unknown option for setup-fonts: ${arg}`);
  }

  if (out.help) {
    return out;
  }

  out.fontDir = out.fontDir || defaultFontDir({ platform, homedir, env });
  if (!out.fontDir) {
    throw new Error("unable to infer default font directory on this platform; use --font-dir");
  }

  return out;
}

function resolveFontSources({ env = process.env, requireResolve = require.resolve } = {}) {
  const logosSource =
    env.LLMQUOTA_LOGOS_FONT_PATH
    || path.resolve(__dirname, "..", "fonts", "LLMQuotaLogos.ttf");

  const cellgaugeSourceFromEnv = env.CELLGAUGE_SYMBOLS_FONT_PATH;
  const cellgaugeSource = cellgaugeSourceFromEnv || path.join(
    path.dirname(requireResolve("cellgauge/package.json")),
    "fonts",
    "CellGaugeSymbols.ttf"
  );

  return [
    {
      label: "LLMQuotaLogos",
      fileName: "LLMQuotaLogos.ttf",
      sourcePath: logosSource,
    },
    {
      label: "CellGaugeSymbols",
      fileName: "CellGaugeSymbols.ttf",
      sourcePath: cellgaugeSource,
    },
  ];
}

function installFonts({
  fontDir,
  platform = process.platform,
  env = process.env,
  requireResolve = require.resolve,
  spawn = spawnSync,
} = {}) {
  const targetDir = fontDir || defaultFontDir({ platform, homedir: os.homedir(), env });
  if (!targetDir) {
    throw new Error("unable to infer default font directory on this platform; use --font-dir");
  }

  const sources = resolveFontSources({ env, requireResolve });

  fs.mkdirSync(targetDir, { recursive: true });
  const installedPaths = [];
  for (const font of sources) {
    if (!fs.existsSync(font.sourcePath)) {
      throw new Error(`font source missing (${font.label}): ${font.sourcePath}`);
    }
    const targetPath = path.join(targetDir, font.fileName);
    fs.copyFileSync(font.sourcePath, targetPath);
    installedPaths.push(targetPath);
  }

  if (platform === "linux") {
    spawn("fc-cache", ["-f", targetDir], { stdio: "ignore" });
  }

  return installedPaths;
}

function setupFontsUsage() {
  return `\
usage: llmquota setup-fonts [--font-dir PATH]

options:
  --font-dir PATH  target directory for LLMQuotaLogos.ttf and CellGaugeSymbols.ttf`;
}

module.exports = {
  defaultFontDir,
  parseSetupFontsArgs,
  resolveFontSources,
  installFonts,
  setupFontsUsage,
  shouldSkipFontInstall,
};
