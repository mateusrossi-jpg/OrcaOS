export function isDevToolsEnabled(): boolean {
  return String(import.meta.env.VITE_ORCAOS_DEV_TOOLS ?? '').trim().toLowerCase() === 'true';
}
