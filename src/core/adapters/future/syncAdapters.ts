import type { SyncSource } from '../../types/future-contracts';

/**
 * Adapter Shell: Preparação para sincronização multi-dispositivo (Local-First Sync).
 * Define o contrato de como os dados locais serão envelopados com metadados para envio à nuvem.
 */
export function wrapEntityForCloudSync<T>(_entity: T, _entityId: string, _version: number): { data: T; metadata: SyncSource } | null {
  // TODO(Scale): Implementar hashing e resolução de conflitos (CRDT/Last-Write-Wins) antes da integração com WebSocket/Supabase.
  return null;
}
