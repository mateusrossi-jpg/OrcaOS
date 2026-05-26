import { describe, it, expect } from 'vitest';
import {
  safeNumber,
  safeString,
  safeBoolean,
  safeArray,
  safeObject,
  safeDate,
  safeTimestamp,
  safeJsonParse,
  safeJsonParseWith,
  sanitizeNumericFields,
  safeEnum,
  deduplicateBy,
} from './safeGuards';

describe('safeNumber', () => {
  it('returns finite numbers as-is', () => {
    expect(safeNumber(42)).toBe(42);
    expect(safeNumber(0)).toBe(0);
    expect(safeNumber(-5.5)).toBe(-5.5);
  });

  it('rejects NaN, Infinity, undefined, null', () => {
    expect(safeNumber(NaN)).toBe(0);
    expect(safeNumber(Infinity)).toBe(0);
    expect(safeNumber(-Infinity)).toBe(0);
    expect(safeNumber(undefined)).toBe(0);
    expect(safeNumber(null)).toBe(0);
  });

  it('parses string numbers', () => {
    expect(safeNumber('3.14')).toBe(3.14);
    expect(safeNumber('abc')).toBe(0);
  });

  it('uses custom fallback', () => {
    expect(safeNumber(null, -1)).toBe(-1);
  });
});

describe('safeString', () => {
  it('returns strings as-is', () => {
    expect(safeString('hello')).toBe('hello');
    expect(safeString('')).toBe('');
  });

  it('rejects non-strings', () => {
    expect(safeString(42)).toBe('');
    expect(safeString(null)).toBe('');
    expect(safeString(undefined)).toBe('');
  });
});

describe('safeBoolean', () => {
  it('returns booleans as-is', () => {
    expect(safeBoolean(true)).toBe(true);
    expect(safeBoolean(false)).toBe(false);
  });

  it('parses string booleans', () => {
    expect(safeBoolean('true')).toBe(true);
    expect(safeBoolean('false')).toBe(false);
  });

  it('rejects other values', () => {
    expect(safeBoolean(42)).toBe(false);
    expect(safeBoolean(null)).toBe(false);
  });
});

describe('safeArray', () => {
  it('returns arrays as-is', () => {
    expect(safeArray([1, 2])).toEqual([1, 2]);
  });

  it('rejects non-arrays', () => {
    expect(safeArray(null)).toEqual([]);
    expect(safeArray('hello')).toEqual([]);
    expect(safeArray({})).toEqual([]);
  });
});

describe('safeObject', () => {
  it('returns objects as-is', () => {
    const obj = { a: 1 };
    expect(safeObject(obj, {})).toBe(obj);
  });

  it('rejects non-objects', () => {
    const fallback = { default: true };
    expect(safeObject(null, fallback)).toBe(fallback);
    expect(safeObject([1, 2], fallback)).toBe(fallback);
    expect(safeObject('str', fallback)).toBe(fallback);
  });
});

describe('safeDate', () => {
  it('returns valid ISO strings as-is', () => {
    const iso = '2026-01-01T00:00:00.000Z';
    expect(safeDate(iso)).toBe(iso);
  });

  it('rejects invalid dates', () => {
    expect(safeDate('not-a-date')).toBe(new Date(0).toISOString());
    expect(safeDate('')).toBe(new Date(0).toISOString());
    expect(safeDate(null)).toBe(new Date(0).toISOString());
  });
});

describe('safeTimestamp', () => {
  it('returns ms for valid date strings', () => {
    expect(safeTimestamp('2026-01-01T00:00:00.000Z')).toBe(new Date('2026-01-01T00:00:00.000Z').getTime());
  });

  it('returns 0 for invalid dates', () => {
    expect(safeTimestamp('nope')).toBe(0);
    expect(safeTimestamp(null)).toBe(0);
    expect(safeTimestamp('')).toBe(0);
  });
});

describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
    expect(safeJsonParse('[1,2]', [])).toEqual([1, 2]);
  });

  it('returns fallback on invalid JSON', () => {
    expect(safeJsonParse('not-json', [])).toEqual([]);
    expect(safeJsonParse(null, 'default')).toBe('default');
    expect(safeJsonParse(undefined, 42)).toBe(42);
    expect(safeJsonParse('', [])).toEqual([]);
  });
});

describe('safeJsonParseWith', () => {
  const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every(i => typeof i === 'string');

  it('returns parsed value when guard passes', () => {
    expect(safeJsonParseWith('["a","b"]', isStringArray, [])).toEqual(['a', 'b']);
  });

  it('returns fallback when guard fails', () => {
    expect(safeJsonParseWith('[1,2]', isStringArray, ['default'])).toEqual(['default']);
  });

  it('returns fallback on parse error', () => {
    expect(safeJsonParseWith('bad-json', isStringArray, [])).toEqual([]);
  });
});

describe('sanitizeNumericFields', () => {
  it('replaces NaN and Infinity with 0', () => {
    const result = sanitizeNumericFields({ a: NaN, b: Infinity, c: 10, d: 'str' });
    expect(result).toEqual({ a: 0, b: 0, c: 10, d: 'str' });
  });

  it('leaves clean objects unchanged', () => {
    const obj = { x: 1, y: 2 };
    expect(sanitizeNumericFields(obj)).toEqual(obj);
  });
});

describe('safeEnum', () => {
  const STATUSES = ['active', 'inactive', 'pending'] as const;

  it('returns value if in allowed set', () => {
    expect(safeEnum('active', STATUSES, 'pending')).toBe('active');
  });

  it('returns fallback if not in allowed set', () => {
    expect(safeEnum('unknown', STATUSES, 'pending')).toBe('pending');
    expect(safeEnum(42, STATUSES, 'pending')).toBe('pending');
    expect(safeEnum(null, STATUSES, 'pending')).toBe('pending');
  });
});

describe('deduplicateBy', () => {
  it('removes duplicates keeping first occurrence', () => {
    const items = [{ id: 'a', v: 1 }, { id: 'b', v: 2 }, { id: 'a', v: 3 }];
    const result = deduplicateBy(items, i => i.id);
    expect(result).toEqual([{ id: 'a', v: 1 }, { id: 'b', v: 2 }]);
  });

  it('handles empty arrays', () => {
    expect(deduplicateBy([], () => '')).toEqual([]);
  });
});
