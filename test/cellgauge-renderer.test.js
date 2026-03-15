const test = require("node:test");
const assert = require("node:assert/strict");

const { renderStackedDualBar } = require("../lib/cellgauge-renderer");

test("renderStackedDualBar clamps negative and overflow values", () => {
  let capturedArgs = null;
  renderStackedDualBar(-10, 150, 0, {
    scriptPath: "/tmp/cellgauge.js",
    runCellGauge: (args) => {
      capturedArgs = args;
      return "x\n";
    },
  });

  assert.deepEqual(capturedArgs, [
    "/tmp/cellgauge.js",
    "0",
    "100",
    "--width",
    "5",
    "--gapped",
    "--border",
  ]);
});

test("renderStackedDualBar always uses gapped border style", () => {
  let capturedArgs = null;
  renderStackedDualBar(50, 25, 4, {
    scriptPath: "/tmp/cellgauge.js",
    runCellGauge: (args) => {
      capturedArgs = args;
      return "bar\n";
    },
  });

  assert.deepEqual(capturedArgs, [
    "/tmp/cellgauge.js",
    "50",
    "25",
    "--width",
    "4",
    "--gapped",
    "--border",
  ]);
});
