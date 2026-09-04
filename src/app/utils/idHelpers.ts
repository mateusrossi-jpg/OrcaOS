import { generateUUID } from '../../core/utils/idGenerator';
export function createId(prefix?: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return generateUUID();
  }
  const base = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
  return prefix ? `${prefix}-${base}` : base;
}

/** @deprecated Use createId instead */
export function createAppId(prefix: string): string {
  return createId(prefix);
}
