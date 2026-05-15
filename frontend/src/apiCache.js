// Shared stale-while-revalidate cache — survives React remounts for the lifetime of the tab.
// Components seed useState() from here, then write back after every successful fetch.
const _store = new Map();

const apiCache = {
  get:    (key) => _store.get(key) ?? null,
  set:    (key, value) => _store.set(key, value),
  has:    (key) => _store.has(key),
  del:    (key) => _store.delete(key),
  // Bust all keys that start with a given prefix (e.g. after a profile update)
  bust:   (prefix) => { for (const k of _store.keys()) if (k.startsWith(prefix)) _store.delete(k); },
};

export default apiCache;
