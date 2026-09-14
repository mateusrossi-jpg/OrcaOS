import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../storage/dexieDatabase';
import { InventoryItem } from '../domain/inventory';

export function useInventoryItems(): InventoryItem[] {
  return useLiveQuery(() => db.inventoryItems.toArray()) || [];
}