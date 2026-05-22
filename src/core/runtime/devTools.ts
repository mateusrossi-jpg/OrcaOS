export function isDevToolsEnabled(): boolean {
  return String(import.meta.env.VITE_AFERIX_DEV_TOOLS ?? '').trim().toLowerCase() === 'true';
}
