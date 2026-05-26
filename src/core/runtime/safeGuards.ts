/**
 * Runtime Safe Guards — ERP-grade boundary validation.
 *
 * Centralized helpers for safe parsing, normalization, and fallback.
 * Used at storage boundaries, hydration, import/export, and external data ingestion.
 *
 * Rules:
 * - Deterministic: same input → same output, always.
 * - No silent masking: invalid data is replaced with explicit defaults, not hidden.
 * - No corruption propagation: NaN, undefined, Infinity are caught at boundary.
 * - No deep cloning unless serialization boundary requires it.
 * - Boundary-only: NOT used inside projections, subscriptions, or UI components.
 */

// ─── Primitive Guards ────────────────────────────────────────────────

/** Returns value if finite number, otherwise returns fallback (default 0). */
export function safeNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

/** Returns value if string, otherwise returns fallback (default ''). */
export function safeString(value: unknown, fallback: string = ''): string {
  if (typeof value === 'string') return value;
  return fallback;
}

/** Returns value if boolean, otherwise returns fallback (default false). */
export function safeBoolean(value: unknown, fallback: boolean = false): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

/** Returns value if valid array, otherwise returns fallback (default []). */
export function safeArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? value : fallback;
}

/** Returns value if non-null object (not array), otherwise returns fallback. */
export function safeObject<T extends Record<string, unknown>>(value: unknown, fallback: T): T {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) return value as T;
  return fallback;
}

// ─── Date Guards ─────────────────────────────────────────────────────

/** Returns ISO string if valid date, otherwise returns fallback. */
export function safeDate(value: unknown, fallback: string = new Date(0).toISOString()): string {
  if (typeof value !== 'string' || value.length === 0) return fallback;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return fallback;
  return value;
}

/** Returns timestamp in ms if valid, otherwise returns 0. */
export function safeTimestamp(dateString: unknown): number {
  if (typeof dateString !== 'string' || dateString.length === 0) return 0;
  const time = new Date(dateString).getTime();
  return Number.isNaN(time) ? 0 : time;
}

// ─── JSON Guards ─────────────────────────────────────────────────────

/**
 * Safe JSON parse with explicit fallback.
 * Never throws. Returns fallback on any parse failure.
 */
export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (raw === null || raw === undefined || raw === '') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safe JSON parse that returns the parsed value only if it passes a type guard.
 * Returns fallback if parsing fails or type guard rejects.
 */
export function safeJsonParseWith<T>(
  raw: string | null | undefined,
  guard: (value: unknown) => value is T,
  fallback: T,
): T {
  if (raw === null || raw === undefined || raw === '') return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    return guard(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

// ─── Serialization Guards ────────────────────────────────────────────

/**
 * Sanitize a numeric record — replaces NaN/Infinity with 0 for all number fields.
 * Used at serialization boundaries before persisting financial data.
 */
export function sanitizeNumericFields<T extends object>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const val = (result as Record<string, unknown>)[key];
    if (typeof val === 'number' && !Number.isFinite(val)) {
      (result as Record<string, unknown>)[key] = 0;
    }
  }
  return result;
}

// ─── Enum Guards ─────────────────────────────────────────────────────

/**
 * Returns value if it is a member of the allowed set, otherwise returns fallback.
 * Type-safe enum validation at boundaries.
 */
export function safeEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) return value as T;
  return fallback;
}

// ─── Array Deduplication ─────────────────────────────────────────────

/**
 * Deduplicate an array by a key extractor function.
 * Keeps the first occurrence of each key.
 */
export function deduplicateBy<T>(items: readonly T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}
