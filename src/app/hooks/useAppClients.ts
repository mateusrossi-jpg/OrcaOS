import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Client, WorkOrder } from '../../core/types/business';
import { clientService } from '../../services/clientService';
import { workOrderService } from '../../services/workOrderService';
import { operationalFacade } from '../../features/workflow/operationalFacade';
import { settingsService } from '../../services/settingsService';

const ACTIVE_WORK_ORDER_KEY = 'activeWorkOrderId';

export function useAppClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, w, activeId] = await Promise.all([
        clientService.getAll(),
        workOrderService.getAll(),
        settingsService.get<string>(ACTIVE_WORK_ORDER_KEY)
      ]);
      setClients(c);
      setWorkOrders(w);
      setActiveWorkOrderId(activeId || null);
    } catch (err) {
      console.error('Failed to load clients/work orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeWorkOrder = useMemo(() => 
    workOrders.find((workOrder) => workOrder.id === activeWorkOrderId) ?? null, 
    [activeWorkOrderId, workOrders]
  );
  
  const activeClient = useMemo(() => 
    (activeWorkOrder?.clientId ? clients.find((client) => client.id === activeWorkOrder.clientId) ?? null : null), 
    [activeWorkOrder?.clientId, clients]
  );
  
  const context = useMemo(() => ({ activeClient, activeWorkOrder }), [activeClient, activeWorkOrder]);

  const convertActiveBudgetToWorkOrder = useCallback(async () => {
    if (!activeWorkOrderId) return;
    const wo = workOrders.find(w => w.id === activeWorkOrderId);
    if (!wo) return;

    const updatedWo: WorkOrder = { 
      ...wo, 
      status: 'in-progress', 
      updatedAt: new Date().toISOString() 
    };
    
    await operationalFacade.updateWorkOrder(updatedWo);
    await loadData();
  }, [activeWorkOrderId, workOrders, loadData]);

  const updateContext = useCallback(async (nextClients: Client[], nextWorkOrders: WorkOrder[], nextActiveWorkOrderId: string | null) => {
    setClients(nextClients);
    setWorkOrders(nextWorkOrders);
    setActiveWorkOrderId(nextActiveWorkOrderId);
    await settingsService.set(ACTIVE_WORK_ORDER_KEY, nextActiveWorkOrderId);
  }, []);

  return {
    clients,
    workOrders,
    activeWorkOrderId,
    activeWorkOrder,
    activeClient,
    context,
    convertActiveBudgetToWorkOrder,
    updateContext,
    loading,
    refresh: loadData
  };
}
