import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DexieCatalogRepository, dexieCatalogRepository } from './dexieCatalogRepository';
import { db } from '../storage/dexieDatabase';
import { CatalogHubItem } from '../features/catalog/storage/catalogHubStorage';

const mockItem1: CatalogHubItem = {
  id: 'cat-item-1',
  kind: 'material',
  title: 'Disjuntor Monofásico 20A',
  category: 'Proteção Elétrica',
  unit: 'un',
  defaultQuantity: 1,
  defaultUnitValue: 25.5,
  destination: 'budget',
  itemType: 'material',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockItem2: CatalogHubItem = {
  id: 'cat-item-2',
  kind: 'labor',
  title: 'Instalação de Quadro Distribuição',
  category: 'Mão de Obra Elétrica',
  unit: 'serviço',
  defaultQuantity: 1,
  defaultUnitValue: 350.0,
  destination: 'budget',
  itemType: 'service',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('DexieCatalogRepository', () => {
  let repository: DexieCatalogRepository;

  beforeEach(async () => {
    await db.catalog.clear();
    repository = new DexieCatalogRepository();
  });

  afterEach(async () => {
    await db.catalog.clear();
  });

  it('getAll returns an empty array when catalog is empty', async () => {
    const items = await repository.getAll();
    expect(items).toEqual([]);
  });

  it('save inserts a new item into the catalog', async () => {
    await repository.save(mockItem1);

    const items = await repository.getAll();
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(mockItem1);
  });

  it('save updates an existing item when id matches', async () => {
    await repository.save(mockItem1);

    const updatedItem: CatalogHubItem = {
      ...mockItem1,
      title: 'Disjuntor Monofásico 20A DIN',
      defaultUnitValue: 28.0,
    };

    await repository.save(updatedItem);

    const items = await repository.getAll();
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Disjuntor Monofásico 20A DIN');
    expect(items[0].defaultUnitValue).toBe(28.0);
  });

  it('delete removes an item from the catalog by id', async () => {
    await repository.save(mockItem1);
    await repository.save(mockItem2);

    expect(await repository.getAll()).toHaveLength(2);

    await repository.delete(mockItem1.id);

    const remainingItems = await repository.getAll();
    expect(remainingItems).toHaveLength(1);
    expect(remainingItems[0].id).toBe(mockItem2.id);
  });

  it('delete handles non-existent item id gracefully without throwing', async () => {
    await repository.save(mockItem1);

    await expect(repository.delete('non-existent-id')).resolves.not.toThrow();

    const items = await repository.getAll();
    expect(items).toHaveLength(1);
  });

  it('bulkAdd inserts multiple items into the catalog', async () => {
    await repository.bulkAdd([mockItem1, mockItem2]);

    const items = await repository.getAll();
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.id)).toContain(mockItem1.id);
    expect(items.map((i) => i.id)).toContain(mockItem2.id);
  });

  it('dexieCatalogRepository exported instance functions correctly', async () => {
    await dexieCatalogRepository.save(mockItem1);

    const items = await dexieCatalogRepository.getAll();
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(mockItem1);
  });
});
