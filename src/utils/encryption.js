const isBrowser = typeof window !== 'undefined';

const fallbackSerializer = {
  stringify: async data => JSON.stringify(data),
  parse: async data => JSON.parse(data),
};

export const secureSerializer = {
  async stringify(data) {
    if (!isEncryptionSupported()) {
      return fallbackSerializer.stringify(data);
    }

    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const key = await getCryptoKey('encrypt');
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
    const combined = new Uint8Array(iv.byteLength + cipher.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipher), iv.byteLength);
    return btoa(String.fromCharCode(...combined));
  },

  async parse(serialized) {
    if (!isEncryptionSupported()) {
      return fallbackSerializer.parse(serialized);
    }

    const binary = Uint8Array.from(atob(serialized), c => c.charCodeAt(0));
    const iv = binary.slice(0, 12);
    const data = binary.slice(12);
    const key = await getCryptoKey('decrypt');
    const decoded = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return JSON.parse(new TextDecoder().decode(decoded));
  },
};

export const sanitizeForStorage = value => {
  if (value == null || typeof value !== 'object') {
    return value;
  }

  return JSON.parse(
    JSON.stringify(value, (key, val) => {
      if (val != null && typeof val === 'object') {
        if (val.constructor && val.constructor.name && val.constructor.name.includes('Element')) {
          return '[DOM Element]';
        }
        if (val.__reactFiber$ || val._reactInternalFiber) {
          return '[React Fiber]';
        }
      }
      return val;
    })
  );
};

export const isEncryptionSupported = () =>
  isBrowser && typeof window.crypto !== 'undefined' && typeof window.crypto.subtle !== 'undefined';

const keyCache = {};

async function getCryptoKey(purpose) {
  const cacheKey = `persistent-${purpose}`;
  if (keyCache[cacheKey]) {
    return keyCache[cacheKey];
  }

  const rawKey = new TextEncoder().encode('fitness-app-persistence-key');
  const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, [purpose]);
  keyCache[cacheKey] = key;
  return key;
}

export default {
  secureSerializer,
  sanitizeForStorage,
  isEncryptionSupported,
};
