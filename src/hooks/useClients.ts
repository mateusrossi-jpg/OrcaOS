import { useState, useEffect } from 'react';
import { Client } from '../domain/client';
import { dexieClientRepository } from '../repositories/dexieClientRepository';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dexieClientRepository.getAll().then(setClients).finally(() => setLoading(false));
  }, []);

  return { clients, loading };
}
