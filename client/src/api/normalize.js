/**
 * Recursive snake_case → camelCase for API response bodies.
 *
 * The backend returns raw PostgreSQL rows (snake_case) from most
 * repositories, and camelCase from a couple of custom-queried ones
 * (e.g. passportApplicationRepository.findForStaff). The frontend
 * was written assuming camelCase everywhere. This helper is the
 * single, central place that normalises the response so pages
 * never need to guess.
 *
 * Excluded on purpose:
 *   - Blobs (downloads) — returned unchanged.
 *   - ArrayBuffer / TypedArray — returned unchanged.
 *   - Date instances — returned unchanged (Date has no keys).
 */

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof Blob) &&
    !(value instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

function camelCaseKey(key) {
  if (!key.includes('_')) return key;
  return key.replace(/_+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
}

export function normalize(value) {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (value instanceof Date) return value;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return value;
  if (value instanceof ArrayBuffer) return value;
  if (ArrayBuffer.isView(value)) return value;
  if (Array.isArray(value)) return value.map(normalize);
  if (!isPlainObject(value)) return value;

  const out = {};
  for (const key of Object.keys(value)) {
    out[camelCaseKey(key)] = normalize(value[key]);
  }
  return out;
}

export default normalize;