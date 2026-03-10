// Simple in-memory LRU-ish cache with TTL
// Not production-grade; can be swapped with Redis later

const DEFAULT_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || '600', 10);

class CacheStore {
  constructor() {
    this.store = new Map();
  }

  _now() {
    return Date.now();
  }

  _isExpired(entry) {
    return entry.expiresAt !== 0 && this._now() > entry.expiresAt;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (this._isExpired(entry)) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
    const expiresAt = ttlSeconds > 0 ? this._now() + ttlSeconds * 1000 : 0;
    this.store.set(key, { value, expiresAt });
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

const cache = new CacheStore();

export function getPageCache(slug) {
  return cache.get(`page:${slug}`);
}

export function setPageCache(slug, payload, ttlSeconds) {
  cache.set(`page:${slug}`, payload, ttlSeconds);
}

export function invalidateBySlug(slug) {
  cache.delete(`page:${slug}`);
}

export function invalidateAll() {
  cache.clear();
}

export default {
  getPageCache,
  setPageCache,
  invalidateBySlug,
  invalidateAll,
};


