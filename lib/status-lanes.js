function stackedLaneValues(result) {
  if (!result || typeof result !== "object") {
    return { top: null, bottom: null };
  }

  if (result.provider === "claude") {
    // Top lane is primary session usage, bottom lane is longer-term usage.
    return {
      top: result.session,
      bottom: result.weekly,
    };
  }

  if (result.provider === "gemini") {
    // Gemini keeps model lanes: Pro over Flash.
    return {
      top: result.proUsed,
      bottom: result.flashUsed,
    };
  }

  if (result.provider === "deepseek") {
    // DeepSeek shows granted vs topped-up as percentage of total balance.
    const total = Number.isFinite(result.totalBalance) && result.totalBalance > 0
      ? result.totalBalance
      : null;
    if (total === null) return { top: null, bottom: null };
    const grantedPct = Number.isFinite(result.grantedBalance)
      ? Math.round((result.grantedBalance / total) * 100)
      : null;
    const toppedUpPct = Number.isFinite(result.toppedUpBalance)
      ? Math.round((result.toppedUpBalance / total) * 100)
      : null;
    return {
      top: grantedPct,
      bottom: toppedUpPct,
    };
  }

  return { top: null, bottom: null };
}

module.exports = {
  stackedLaneValues,
};
