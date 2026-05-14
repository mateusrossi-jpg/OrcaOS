import { createClient } from '@supabase/supabase-js';

/**
 * Web Worker de Sincronização
 * Nota: Workers não têm acesso a localStorage ou DOM. 
 * Eles recebem dados via message, processam/enviam para a nuvem e devolvem o resultado.
 */

self.onmessage = async (event: MessageEvent) => {
  const { budgets, token } = event.data;

  if (!token) {
    self.postMessage({ status: 'error', message: 'Usuário não autenticado. Sincronização em pausa.' });
    return;
  }

  // Cria um cliente do Supabase exclusivo para o Worker, injetando o JWT
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const workerSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` }
    }
  });

  try {
    // Executa a operação real de Upsert em massa (array) na tabela de orçamentos
    const { error } = await workerSupabase.from('budgets').upsert(budgets);
    if (error) throw error;

    // Processamento da sincronização...
    // Extraímos apenas os IDs que deram sucesso para devolver à Main Thread
    const syncedIds = budgets.map((b: any) => b.id);

    self.postMessage({ status: 'success', syncedIds });
  } catch (error) {
    self.postMessage({ status: 'error', message: 'Falha ao sincronizar com o servidor' });
  }
};

export {}; // Torna o arquivo um módulo TypeScript isolado