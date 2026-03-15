const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const CACHE_DIR = path.join(os.homedir(), ".cache", "llmquota");

function cachePathFor(provider) {
  return path.join(CACHE_DIR, `${provider}.json`);
}

function readCache(provider) {
  try {
    const raw = fs.readFileSync(cachePathFor(provider), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(provider, data, retryAfterSec) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    if (data) {
      const entry = {
        fetchedAt: Date.now(),
        retryAfter: retryAfterSec || null,
        data,
      };
      fs.writeFileSync(cachePathFor(provider), JSON.stringify(entry), "utf8");
    } else if (retryAfterSec) {
      // 429: preserve existing cached data, just update the retry-after window
      const existing = readCache(provider);
      const entry = {
        fetchedAt: Date.now(),
        retryAfter: retryAfterSec,
        data: existing ? existing.data : null,
      };
      fs.writeFileSync(cachePathFor(provider), JSON.stringify(entry), "utf8");
    }
  } catch {
    // best-effort
  }
}

function getCachedIfFresh(provider) {
  const entry = readCache(provider);
  if (!entry || !entry.retryAfter || !entry.fetchedAt) return null;
  const expiresAt = entry.fetchedAt + entry.retryAfter * 1000;
  if (Date.now() >= expiresAt) return null;
  if (entry.data) return { ...entry.data, cached: true };
  // Within retry-after window but no prior data — return error to avoid hitting API
  return { provider, error: "rate limited", cached: true };
}

function getCachedStale(provider) {
  const entry = readCache(provider);
  if (!entry || !entry.data) return null;
  return { ...entry.data, cached: true };
}

module.exports = {
  writeCache,
  getCachedIfFresh,
  getCachedStale,
};
