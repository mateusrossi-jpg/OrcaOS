import 'fake-indexeddb/auto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../storage/dexieDatabase';
import { clientService } from '../services/clientService';
import { siteService } from '../services/siteService';
import { assetService } from '../services/assetService';
import { AssetType, AssetStatus } from '../domain/asset';

describe('PHASE 3B: SITE AND ASSET FOUNDATION INTEGRATION TEST', () => {
  beforeAll(async () => {
    await db.clients.clear();
    await db.sites.clear();
    await db.assets.clear();
    await db.operationalEvents.clear();
  });

  afterAll(async () => {
    await db.clients.clear();
    await db.sites.clear();
    await db.assets.clear();
    await db.operationalEvents.clear();
  });

  it('successfully migrates client address to a Site and manages assets', async () => {
    // 1. Create a client with an address (representing a legacy client)
    const client = await clientService.add({
      name: 'João Silva Engenharia',
      address: 'Rua das Flores, 123 - Centro, São Paulo/SP',
      phone: '11988887777',
      email: 'joao@silva.com',
      contributorType: 'taxpayer',
      creditLimit: '10000'
    });

    // 2. Fetch sites for this client (Triggering Auto-Site Migration)
    const sites = await siteService.getByClientId(client.id);
    
    expect(sites.length).toBe(1);
    expect(sites[0].name).toBe('Site Principal');
    expect(sites[0].fullAddress).toBe('Rua das Flores, 123 - Centro, São Paulo/SP');
    expect(sites[0].isMain).toBe(true);

    // 3. Verify that a SITE_CREATED event was emitted
    const events = await db.operationalEvents.toArray();
    const siteEvent = events.find(e => e.eventType === 'SITE_CREATED');
    expect(siteEvent).toBeDefined();
    expect(siteEvent?.aggregateId).toBe(sites[0].id);

    // 4. Register an Asset for this Site
    const asset = await assetService.add({
      clientId: client.id,
      siteId: sites[0].id,
      name: 'Ar Condicionado Central 01',
      assetType: 'EQUIPMENT',
      category: 'Climatização',
      manufacturer: 'Carrier',
      model: 'V3-400',
      serialNumber: 'SN-998877',
      assetStatus: 'ACTIVE'
    });

    expect(asset.id).toBeDefined();
    expect(asset.siteId).toBe(sites[0].id);

    // 5. Verify that an ASSET_REGISTERED event was emitted
    const updatedEvents = await db.operationalEvents.toArray();
    const assetEvent = updatedEvents.find(e => e.eventType === 'ASSET_REGISTERED');
    expect(assetEvent).toBeDefined();
    expect(assetEvent?.aggregateId).toBe(asset.id);

    // 6. Update Asset status
    await assetService.update({
      ...asset,
      assetStatus: 'MAINTENANCE'
    });

    const updatedAsset = await assetService.getById(asset.id);
    expect(updatedAsset?.assetStatus).toBe('MAINTENANCE');

    // 7. Verify ASSET_UPDATED event
    const finalEvents = await db.operationalEvents.toArray();
    const assetUpdateEvent = finalEvents.find(e => e.eventType === 'ASSET_UPDATED');
    expect(assetUpdateEvent).toBeDefined();
    expect(assetUpdateEvent?.aggregateId).toBe(asset.id);
  });
});
