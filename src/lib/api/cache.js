class APICache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
  }

  get(key) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() > timestamp) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  generateKey(url, options = {}) {
    const { method = 'GET', body, params } = options;
    return `${method}:${url}:${JSON.stringify({ body, params })}`;
  }
}

export const apiCache = new APICache();