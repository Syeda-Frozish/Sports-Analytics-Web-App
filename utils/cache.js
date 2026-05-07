// Simple in-memory cache utility
const cache = {};

function setCache(key, value, ttlMs) {
  cache[key] = { value, expires: Date.now() + ttlMs };
}

function getCache(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    delete cache[key];
    return null;
  }
  return entry.value;
}

module.exports = { setCache, getCache };
