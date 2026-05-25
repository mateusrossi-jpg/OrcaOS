import { useState, useEffect } from 'react';
import { Client } from '../domain/client';
import { clientService } from '../services/clientService';

/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 * Do not access storage/repository directly from UI/hooks.
 */
export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientService.getAll().then(setClients).finally(() => setLoading(false));
  }, []);

  return { clients, loading };
}
