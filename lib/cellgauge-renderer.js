const { execFileSync } = require("node:child_process");

function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

function defaultRunCellGauge(args) {
  return execFileSync(process.execPath, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
}

function renderStackedDualBar(topPct, bottomPct, widthCells, options = {}) {
  const safeWidth = Math.max(1, Math.trunc(widthCells || 5));
  const scriptPath = options.scriptPath || require.resolve("cellgauge/bin/cellgauge.js");

  const args = [
    scriptPath,
    String(clampPercent(topPct)),
    String(clampPercent(bottomPct)),
    "--width",
    String(safeWidth),
    "--gapped",
    "--border",
  ];

  const runner = typeof options.runCellGauge === "function"
    ? options.runCellGauge
    : defaultRunCellGauge;
  const raw = runner(args);
  return String(raw).replace(/[\r\n]+$/, "");
}

module.exports = {
  renderStackedDualBar,
};
