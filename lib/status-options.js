const VALUE_FLAGS = ["--bar-width"];

function parsePositiveInt(value) {
  const n = Number.parseInt(String(value || "").trim(), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function consumesValue(arg, flags) {
  for (const flag of flags) {
    if (arg === flag || arg.startsWith(`${flag}=`)) return true;
  }
  return false;
}

function parseBarWidthFromArgs(args) {
  if (!Array.isArray(args)) return null;
  let barWidth = null;
  for (let i = 0; i < args.length; i += 1) {
    const arg = String(args[i] || "");
    if (arg.startsWith("--bar-width=")) {
      const parsed = parsePositiveInt(arg.slice("--bar-width=".length));
      if (parsed !== null) barWidth = parsed;
      continue;
    }
    if (arg === "--bar-width") {
      const parsed = parsePositiveInt(args[i + 1]);
      if (parsed !== null) barWidth = parsed;
      i += 1;
    }
  }
  return barWidth;
}

function resolveBarWidth(options = {}) {
  const args = options.args || [];
  const env = options.env || process.env;
  const argValue = parseBarWidthFromArgs(args);
  if (argValue !== null) return argValue;
  const envValue = parsePositiveInt(env.OU_BAR_WIDTH);
  return envValue === null ? 5 : envValue;
}

function collectSelectedProviders(args) {
  if (!Array.isArray(args)) return [];
  const selected = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = String(args[i] || "");
    if (consumesValue(arg, VALUE_FLAGS)) {
      if (!arg.includes("=")) i += 1;
      continue;
    }
    if (arg.startsWith("--")) continue;
    selected.push(arg.toLowerCase());
  }
  return selected;
}

module.exports = {
  collectSelectedProviders,
  resolveBarWidth,
};
