import { Budget } from './budget';
import { Client } from './client';
import { WorkOrder } from '../core/types/business';
import { aferixLogger } from '../core/debug/aferixLogger';

export function validateBudgetIntegrity(budget: Budget): boolean {
  if (!budget.id) {
    aferixLogger.error('Aferix Integrity', 'Budget missing ID', budget);
    return false;
  }
  if (!budget.clientId) {
    aferixLogger.warn('Aferix Integrity', 'Budget missing clientId', budget);
  }
  if (!budget.syncStatus || !['pending', 'synced', 'deleted'].includes(budget.syncStatus)) {
    aferixLogger.error('Aferix Integrity', 'Budget has invalid syncStatus', budget);
    return false;
  }
  if (typeof budget.syncUpdatedAt !== 'number' || isNaN(budget.syncUpdatedAt)) {
    aferixLogger.error('Aferix Integrity', 'Budget has invalid syncUpdatedAt', budget);
    return false;
  }
  if (!budget.updatedAt || typeof budget.updatedAt !== 'string') {
    aferixLogger.error('Aferix Integrity', 'Budget has invalid updatedAt (must be ISO string)', budget);
    return false;
  }
  return true;
}

export function validateClientIntegrity(client: Client): boolean {
  if (!client.id) {
    aferixLogger.error('Aferix Integrity', 'Client missing ID', client);
    return false;
  }
  if (!client.syncStatus || !['pending', 'synced', 'deleted'].includes(client.syncStatus)) {
    aferixLogger.error('Aferix Integrity', 'Client has invalid syncStatus', client);
    return false;
  }
  if (typeof client.syncUpdatedAt !== 'number' || isNaN(client.syncUpdatedAt)) {
    aferixLogger.error('Aferix Integrity', 'Client has invalid syncUpdatedAt', client);
    return false;
  }
  return true;
}

export function validateWorkOrderIntegrity(workOrder: WorkOrder): boolean {
  if (!workOrder.id) {
    aferixLogger.error('Aferix Integrity', 'WorkOrder missing ID', workOrder);
    return false;
  }
  if (!workOrder.clientId) {
    aferixLogger.error('Aferix Integrity', 'WorkOrder missing clientId (orphan OS not allowed)', workOrder);
    return false;
  }
  if (!workOrder.syncStatus || !['pending', 'synced', 'deleted'].includes(workOrder.syncStatus)) {
    aferixLogger.error('Aferix Integrity', 'WorkOrder has invalid syncStatus', workOrder);
    return false;
  }
  if (typeof workOrder.syncUpdatedAt !== 'number' || isNaN(workOrder.syncUpdatedAt)) {
    aferixLogger.error('Aferix Integrity', 'WorkOrder has invalid syncUpdatedAt', workOrder);
    return false;
  }
  return true;
}
