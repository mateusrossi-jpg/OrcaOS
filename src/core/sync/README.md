# Sync Layer — Aferix

Responsável pela persistência e sincronização de dados multi-dispositivo, mantendo a filosofia *Local-First* do aplicativo.

## Estratégia de Sincronização
- **Foco Local:** O app deve operar 100% offline. O sync ocorre em background.
- **Conflitos:** Implementar estratégias de Last-Write-Wins (LWW) ou CRDTs (Conflict-free Replicated Data Types) utilizando o contrato `SyncSource`.
- **Transporte:** Preparado para integrações com Supabase Realtime, Firebase ou WebRTC.

## Fluxo de Dados
1. UI altera dado local -> Atualiza `localStorage`.
2. Sync Layer detecta mudança -> Envelopa dado via `wrapEntityForCloudSync`.
3. Tenta envio para nuvem -> Em caso de erro, marca para retry (Queue).
4. Sucesso -> Atualiza metadados de sync local.
