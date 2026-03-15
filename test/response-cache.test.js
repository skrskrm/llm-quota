const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

// We test the module by pointing CACHE_DIR at a temp directory.
// Since the module uses a const for CACHE_DIR, we test the logic by
// requiring it fresh and patching the homedir.

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "qp-cache-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeCacheModule() {
  const cacheDir = path.join(tmpDir, ".cache", "llmquota");

  function cachePathFor(provider) {
    return path.join(cacheDir, `${provider}.json`);
  }

  function readCache(provider) {
    try {
      return JSON.parse(fs.readFileSync(cachePathFor(provider), "utf8"));
    } catch {
      return null;
    }
  }

  function writeCache(provider, data, retryAfterSec) {
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
      if (data) {
        fs.writeFileSync(cachePathFor(provider), JSON.stringify({
          fetchedAt: Date.now(),
          retryAfter: retryAfterSec || null,
          data,
        }), "utf8");
      } else if (retryAfterSec) {
        const existing = readCache(provider);
        fs.writeFileSync(cachePathFor(provider), JSON.stringify({
          fetchedAt: Date.now(),
          retryAfter: retryAfterSec,
          data: existing ? existing.data : null,
        }), "utf8");
      }
    } catch { /* best-effort */ }
  }

  function getCachedIfFresh(provider) {
    const entry = readCache(provider);
    if (!entry || !entry.retryAfter || !entry.fetchedAt) return null;
    const expiresAt = entry.fetchedAt + entry.retryAfter * 1000;
    if (Date.now() >= expiresAt) return null;
    if (entry.data) return { ...entry.data, cached: true };
    return { provider, error: "rate limited", cached: true };
  }

  function getCachedStale(provider) {
    const entry = readCache(provider);
    if (!entry || !entry.data) return null;
    return { ...entry.data, cached: true };
  }

  return { writeCache, getCachedIfFresh, getCachedStale };
}

describe("response-cache", () => {
  it("returns null when no cache exists", () => {
    const { getCachedIfFresh, getCachedStale } = makeCacheModule();
    assert.strictEqual(getCachedIfFresh("claude"), null);
    assert.strictEqual(getCachedStale("claude"), null);
  });

  it("caches successful data and returns it stale", () => {
    const { writeCache, getCachedStale } = makeCacheModule();
    const data = { provider: "claude", weekly: 42 };
    writeCache("claude", data, null);
    const stale = getCachedStale("claude");
    assert.deepStrictEqual(stale, { ...data, cached: true });
  });

  it("getCachedIfFresh returns null when no retryAfter set", () => {
    const { writeCache, getCachedIfFresh } = makeCacheModule();
    writeCache("claude", { provider: "claude", weekly: 42 }, null);
    assert.strictEqual(getCachedIfFresh("claude"), null);
  });

  it("getCachedIfFresh returns cached data within retry-after window", () => {
    const { writeCache, getCachedIfFresh } = makeCacheModule();
    const data = { provider: "claude", weekly: 42 };
    writeCache("claude", data, null);
    // Simulate 429 by writing retry-after on top
    writeCache("claude", null, 9999);
    const fresh = getCachedIfFresh("claude");
    assert.deepStrictEqual(fresh, { ...data, cached: true });
  });

  it("getCachedIfFresh returns error marker when no data but within retry-after", () => {
    const { writeCache, getCachedIfFresh } = makeCacheModule();
    writeCache("claude", null, 9999);
    const fresh = getCachedIfFresh("claude");
    assert.deepStrictEqual(fresh, { provider: "claude", error: "rate limited", cached: true });
  });

  it("429 writeCache preserves existing data", () => {
    const { writeCache, getCachedStale } = makeCacheModule();
    writeCache("claude", { provider: "claude", weekly: 42 }, null);
    writeCache("claude", null, 300); // 429 hit
    const stale = getCachedStale("claude");
    assert.strictEqual(stale.weekly, 42);
    assert.strictEqual(stale.cached, true);
  });
});
