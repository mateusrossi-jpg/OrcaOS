import { db } from './src/storage/dexieDatabase';
import { assetService } from './src/services/assetService';
import { operationalFacade } from './src/features/workflow/operationalFacade';

async function seedAssets() {
  console.log("Seeding assets...");
  
  const assets = await assetService.getAll();
  if (assets.length > 0) {
    console.log("Assets already seeded.");
    return;
  }

  const a1 = await assetService.add({
    clientId: 'client-1',
    siteId: 'site-1',
    name: 'Chiller Principal',
    assetType: 'EQUIPMENT',
    category: 'HVAC',
    tag: 'CH-01',
    manufacturer: 'Carrier',
    model: '30XW',
    location: 'Central de Água Gelada',
    assetStatus: 'ACTIVE',
    companyId: 'default-company',
    workspaceId: 'default-workspace'
  });

  const a2 = await assetService.add({
    clientId: 'client-1',
    siteId: 'site-1',
    name: 'Painel de Comando Elétrico',
    assetType: 'EQUIPMENT',
    category: 'Elétrica',
    tag: 'PNL-ADM-01',
    manufacturer: 'WEG',
    model: 'CCM-01',
    location: 'Sala Técnica',
    assetStatus: 'MAINTENANCE',
    companyId: 'default-company',
    workspaceId: 'default-workspace'
  });

  console.log("Assets created. Creating a work order for Chiller...");
  
  const woId = await operationalFacade.createWorkOrderForAsset(a1.id);
  console.log(`Work Order created: ${woId}. Now simulating completion to generate history...`);
  
  await operationalFacade.completeWorkOrder(woId, 1500, 1500, "Limpeza de condensadores e teste de estanqueidade.");
  
  console.log("Integration test completed successfully.");
}

seedAssets().catch(console.error);
