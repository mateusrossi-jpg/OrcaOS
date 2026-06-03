import { generateUUID } from '../core/utils/idGenerator';
import { db } from '../storage/dexieDatabase';
import { Client } from '../domain/client';
import { Site } from '../domain/site';
import { Asset } from '../domain/asset';
import { WorkOrder } from '../core/types/business';
import { AssetExecution } from '../domain/assetExecution';

const generateId = () => generateUUID();

export class DemoBootstrapService {
  /**
   * Initializes the database with Demo data if it's completely empty.
   * This is part of the AFERIX FIELD VALIDATION SPRINT.
   * Scenario: Shopping Exemplo, Bloco A, 50 aparelhos, PMOC mensal, 2 anomalias.
   */
  static async bootstrapIfEmpty(): Promise<void> {
    const clientCount = await db.clients.count();
    const workOrderCount = await db.workOrders.count();

    if (clientCount > 0 || workOrderCount > 0) {
      // Database already has data, no need to bootstrap
      return;
    }

    console.log('[DemoBootstrapService] Injecting Real-World Commercial Scenario...');

    const companyId = 'demo-company';
    const workspaceId = 'demo-workspace';
    const now = new Date().toISOString();

    // 1. Create a Client
    const clientId = generateId();
    const client: Client = {
      id: clientId,
      companyId,
      workspaceId,
      name: 'Shopping Exemplo',
      documentNumber: '12.345.678/0001-99',
      email: 'manutencao@shoppingexemplo.com.br',
      phone: '(11) 3333-4444',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    };

    // 2. Create a Site
    const siteId = generateId();
    const site: Site = {
      id: siteId,
      companyId,
      workspaceId,
      clientId,
      name: 'Bloco A',
      fullAddress: 'Av. das Nações Unidas, 1000 - São Paulo, SP',
      isMain: true,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    };

    // 3. Create 50 Assets (PMOC - Climatização)
    const assets: Asset[] = [];
    const assetIds: string[] = [];
    
    for (let i = 1; i <= 50; i++) {
      const assetId = generateId();
      assetIds.push(assetId);
      assets.push({
        id: assetId,
        companyId,
        workspaceId,
        name: `Ar Condicionado Split ${i <= 10 ? '60.000' : '12.000'} BTUs`,
        assetType: 'EQUIPMENT',
        category: 'Climatização',
        tag: `AC-${i.toString().padStart(3, '0')}`,
        location: `Loja ${100 + i}`,
        assetStatus: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending'
      });
    }

    // 4. Create a Work Order (Service)
    const workOrderId = generateId();
    const workOrder: WorkOrder = {
      id: workOrderId,
      companyId,
      workspaceId,
      clientId,
      siteId,
      assetIds: assetIds,
      title: 'PMOC Mensal - Bloco A',
      description: 'Execução do plano de manutenção, operação e controle mensal preventivo dos equipamentos de climatização do Bloco A.',
      status: 'in-progress',
      priority: 'high',
      paymentStatus: 'pending',
      scheduledDate: now,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    };

    // 5. Create Asset Executions (Only 2 with anomalies, rest normal or not filled yet to simulate field work)
    const executions: AssetExecution[] = [];
    
    // Anomaly 1
    executions.push({
      id: generateId(),
      companyId,
      workspaceId,
      workOrderId,
      assetId: assetIds[0],
      measurements: {
        temperaturaInsulflamento: 22, // alta
        correnteOperacao: 8.5
      },
      checklistResults: [
        {
          itemKey: 'filter_clean',
          description: 'Limpeza dos filtros',
          status: 'compliant'
        },
        {
          itemKey: 'gas_pressure',
          description: 'Verificação da pressão do gás',
          status: 'non-compliant',
          notes: 'Vazamento detectado na válvula de serviço.'
        }
      ],
      recommendation: 'Necessário agendar retorno corretivo para reparo de vazamento e recarga de fluido refrigerante.',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    });

    // Anomaly 2
    executions.push({
      id: generateId(),
      companyId,
      workspaceId,
      workOrderId,
      assetId: assetIds[15],
      measurements: {
        temperaturaInsulflamento: 16,
        correnteOperacao: 14.2 // alta corrente
      },
      checklistResults: [
        {
          itemKey: 'filter_clean',
          description: 'Limpeza dos filtros',
          status: 'compliant'
        },
        {
          itemKey: 'compressor_noise',
          description: 'Ruído anormal no compressor',
          status: 'non-compliant',
          notes: 'Compressor operando com ruído metálico elevado.'
        }
      ],
      recommendation: 'Acompanhar vida útil do compressor. Sugestão de orçamento para substituição preventiva.',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending'
    });

    // 3 Normal ones, just as a sample
    for (let i = 2; i < 5; i++) {
      executions.push({
        id: generateId(),
        companyId,
        workspaceId,
        workOrderId,
        assetId: assetIds[i],
        measurements: {
          temperaturaInsulflamento: 15,
          correnteOperacao: 5.2
        },
        checklistResults: [
          { itemKey: 'filter_clean', description: 'Limpeza dos filtros', status: 'compliant' },
          { itemKey: 'gas_pressure', description: 'Verificação da pressão do gás', status: 'compliant' }
        ],
        recommendation: 'Operando normalmente.',
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending'
      });
    }

    // Use transaction to ensure data integrity
    await db.transaction('rw', 
      db.clients, 
      db.sites, 
      db.assets, 
      db.workOrders, 
      db.assetExecutions, 
      async () => {
        await db.clients.add(client);
        await db.sites.add(site);
        await db.assets.bulkAdd(assets);
        await db.workOrders.add(workOrder);
        await db.assetExecutions.bulkAdd(executions);
    });

    console.log('[DemoBootstrapService] Commercial Scenario injected successfully.');
  }
}
