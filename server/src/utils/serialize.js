/**
 * Recursive snake_case → camelCase conversion for JSON-serialisable
 * values. Used by every repository response so the frontend can read
 * a single, consistent shape regardless of the underlying DB schema.
 *
 * Rules:
 *   - Plain objects: every key is converted; every value is recursed.
 *   - Arrays: every element is recursed. Arrays are never converted
 *     to camelCase themselves (they have no keys).
 *   - Primitives, Date, Buffer, and null: returned unchanged.
 *   - No-op for already-camelCase keys.
 *
 * Usage:
 *   const { toCamel } = require('../utils/serialize');
 *   const camelRow = toCamel(rawRow);
 */

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof Buffer) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

function camelCaseKey(key) {
  // Fast path: no underscores, nothing to do.
  if (!key.includes('_')) return key;
  return key.replace(/_+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
}

function toCamel(value) {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (value instanceof Date) return value;
  if (value instanceof Buffer) return value;
  if (Array.isArray(value)) return value.map(toCamel);
  if (!isPlainObject(value)) return value;

  const out = {};
  for (const key of Object.keys(value)) {
    out[camelCaseKey(key)] = toCamel(value[key]);
  }
  return out;
}

module.exports = { toCamel };