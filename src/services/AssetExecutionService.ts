import { generateUUID } from '../core/utils/idGenerator';
// src/services/AssetExecutionService.ts
import { db } from '../storage/dexieDatabase';
import { AssetExecution } from '../domain/assetExecution';
import { Service as WorkOrder } from '../core/types/business';
import { aferixLogger } from '../core/debug/aferixLogger';

export class AssetExecutionService {
  private static instance: AssetExecutionService;

  private constructor() {}

  static getInstance(): AssetExecutionService {
    if (!AssetExecutionService.instance) {
      AssetExecutionService.instance = new AssetExecutionService();
    }
    return AssetExecutionService.instance;
  }

  /**
   * Salva múltiplos registros de execução técnica utilizando Dexie bulkPut de alta performance.
   * Envelopa a persistência em uma única transação rápida.
   */
  async saveAssetExecutions(executions: AssetExecution[]): Promise<void> {
    if (!executions || executions.length === 0) return;

    try {
      await db.transaction('rw', db.assetExecutions, async () => {
        await db.assetExecutions.bulkPut(executions);
      });
      aferixLogger.audit('AssetExecution', `Persistência bulkPut concluída com sucesso para ${executions.length} execuções.`);
    } catch (err) {
      aferixLogger.error('AssetExecution', `Falha ao executar bulkPut de execuções de ativos`, err);
      throw err;
    }
  }

  /**
   * Cria ordens de serviço PMOC para vistorias multi-ativos.
   * Se o número de ativos exceder 250, divide-os de forma automática (Safelimit Splitter)
   * em múltiplas ordens de serviço de no máximo 250 ativos cada para proteger a memória RAM mobile.
   */
  async createPMOCWorkOrders(
    attendanceId: string,
    companyId: string,
    workspaceId: string,
    clientId: string,
    siteId: string,
    assetIds: string[]
  ): Promise<string[]> {
    if (!assetIds || assetIds.length === 0) {
      return [];
    }

    const maxLimit = 250;
    const generatedWorkOrderIds: string[] = [];
    const executionBatches: AssetExecution[] = [];
    const workOrderBatches: WorkOrder[] = [];

    // Particionamento dos ativos (Safelimit Splitter)
    const partitions: string[][] = [];
    for (let i = 0; i < assetIds.length; i += maxLimit) {
      partitions.push(assetIds.slice(i, i + maxLimit));
    }

    aferixLogger.info('AssetExecution', `Planejamento de PMOC: dividindo ${assetIds.length} ativos em ${partitions.length} lotes de OS.`);

    for (let pIndex = 0; pIndex < partitions.length; pIndex++) {
      const activeAssetIds = partitions[pIndex];
      const woId = `wo-pmoc-${Date.now()}-${pIndex}-${generateUUID().slice(0, 8)}`;
      
      const newWO: WorkOrder = {
        id: woId,
        clientId,
        siteId,
        attendanceId,
        companyId,
        workspaceId,
        title: `Inspeção PMOC Lote ${pIndex + 1} (${activeAssetIds.length} Ativos)`,
        status: 'draft',
        paymentStatus: 'pending',
        assetIds: activeAssetIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending'
      };

      workOrderBatches.push(newWO);
      generatedWorkOrderIds.push(woId);

      // Pré-popula os registros vazios de execução para cada ativo deste lote
      for (const assetId of activeAssetIds) {
        const executionId = `exec-${generateUUID().slice(0, 8)}`;
        const newExecution: AssetExecution = {
          id: executionId,
          workOrderId: woId,
          assetId,
          companyId,
          workspaceId,
          measurements: {},
          checklistResults: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending'
        };
        executionBatches.push(newExecution);
      }
    }

    // Gravação das OSs e execuções em transação única
    await db.transaction('rw', [db.workOrders, db.assetExecutions], async () => {
      await db.workOrders.bulkPut(workOrderBatches);
      await db.assetExecutions.bulkPut(executionBatches);
    });

    aferixLogger.audit('AssetExecution', `PMOC OSs e Execuções salvas com sucesso no banco local.`);
    return generatedWorkOrderIds;
  }
}

export const assetExecutionService = AssetExecutionService.getInstance();
