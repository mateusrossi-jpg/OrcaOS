import { loadCatalogHubItems, saveCatalogHubItems, type CatalogHubItem } from './catalogHubStorage';

export const CATALOG_HUB_ITEMS_CHANGED_EVENT = 'orcaos:catalog-hub-items-changed';

function normalize(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}

function sameCatalogIdentity(a: CatalogHubItem, b: CatalogHubItem): boolean {
  return normalize(a.title) === normalize(b.title) && normalize(a.brand) === normalize(b.brand) && normalize(a.model) === normalize(b.model);
}

export function notifyCatalogHubItemsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CATALOG_HUB_ITEMS_CHANGED_EVENT));
}

export function upsertExternalCatalogHubItem(item: CatalogHubItem): { item: CatalogHubItem; action: 'created' | 'updated' } {
  const currentItems = loadCatalogHubItems();
  const existingItem = currentItems.find((currentItem) => sameCatalogIdentity(currentItem, item));
  const timestamp = new Date().toISOString();

  if (existingItem) {
    const updatedItem: CatalogHubItem = {
      ...existingItem,
      ...item,
      id: existingItem.id,
      createdAt: existingItem.createdAt,
      updatedAt: timestamp,
    };
    saveCatalogHubItems(currentItems.map((currentItem) => (currentItem.id === existingItem.id ? updatedItem : currentItem)));
    notifyCatalogHubItemsChanged();
    return { item: updatedItem, action: 'updated' };
  }

  saveCatalogHubItems([{ ...item, updatedAt: timestamp }, ...currentItems]);
  notifyCatalogHubItemsChanged();
  return { item, action: 'created' };
}
