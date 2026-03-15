function secondsUntilReset(value, nowMs) {
  if (!value || typeof value !== "string") return null;
  const targetMs = Date.parse(value);
  if (!Number.isFinite(targetMs)) return null;
  return Math.max(0, Math.ceil((targetMs - nowMs) / 1000));
}

function attachResetDurations(result, nowMs = Date.now()) {
  if (!result || typeof result !== "object" || Array.isArray(result)) return result;

  const out = { ...result };
  const resetInSeconds = {};
  for (const [key, value] of Object.entries(result)) {
    if (!key.endsWith("Reset")) continue;
    const seconds = secondsUntilReset(value, nowMs);
    if (seconds === null) continue;
    resetInSeconds[key] = seconds;
  }

  const values = Object.values(resetInSeconds);
  if (values.length === 0) return out;

  out.resetInSeconds = resetInSeconds;
  out.nextResetInSeconds = Math.min(...values);
  out.allResetsInSeconds = Math.max(...values);
  return out;
}

module.exports = {
  attachResetDurations,
  secondsUntilReset,
};
