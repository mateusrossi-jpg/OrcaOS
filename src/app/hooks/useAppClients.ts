import { useState, useMemo, useCallback } from 'react';
import type { Client, WorkOrder } from '../../core/types/business';
import { loadActiveWorkOrderId, loadClients, loadWorkOrders, saveWorkOrders } from '../../features/clients/storage/clientWorkOrderStorage';

export function useAppClients() {
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => loadWorkOrders());
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(() => loadActiveWorkOrderId());

  const activeWorkOrder = useMemo(() => 
    workOrders.find((workOrder) => workOrder.id === activeWorkOrderId) ?? null, 
    [activeWorkOrderId, workOrders]
  );
  
  const activeClient = useMemo(() => 
    (activeWorkOrder?.clientId ? clients.find((client) => client.id === activeWorkOrder.clientId) ?? null : null), 
    [activeWorkOrder?.clientId, clients]
  );
  
  const context = useMemo(() => ({ activeClient, activeWorkOrder }), [activeClient, activeWorkOrder]);

  const convertActiveBudgetToWorkOrder = useCallback(() => {
    if (!activeWorkOrderId) return;
    setWorkOrders((current) => {
      const updatedWorkOrders = current.map((workOrder) => (
        workOrder.id === activeWorkOrderId
          ? { ...workOrder, status: 'in-progress' as const, updatedAt: new Date().toISOString() }
          : workOrder
      ));
      saveWorkOrders(updatedWorkOrders);
      return updatedWorkOrders;
    });
  }, [activeWorkOrderId]);

  const updateContext = useCallback((nextClients: Client[], nextWorkOrders: WorkOrder[], nextActiveWorkOrderId: string | null) => {
    setClients(nextClients);
    setWorkOrders(nextWorkOrders);
    setActiveWorkOrderId(nextActiveWorkOrderId);
  }, []);

  return {
    clients,
    workOrders,
    activeWorkOrderId,
    activeWorkOrder,
    activeClient,
    context,
    convertActiveBudgetToWorkOrder,
    updateContext
  };
}
