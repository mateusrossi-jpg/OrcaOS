import React from 'react';
import { useSyncManager } from '../../core/sync/useSyncManager';

export function SyncIndicator() {
  const { status } = useSyncManager();

  // Mapeamento de status para cores e textos (Minimalista e Tipográfico)
  const statusConfig = {
    synced: { color: '#10B981', text: 'Sincronizado' },   // Verde (Green-500)
    pending: { color: '#F59E0B', text: 'Pendente' },       // Âmbar (Amber-500)
    offline: { color: '#EF4444', text: 'Offline' },        // Vermelho (Red-500)
  };

  const current = statusConfig[status];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#D1D5DB' }}>
      <span 
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: current.color,
          boxShadow: `0 0 8px ${current.color}80`, // Brilho suave
          transition: 'background-color 0.3s ease'
        }} 
      />
      <span style={{ fontWeight: 500 }}>{current.text}</span>
    </div>
  );
}