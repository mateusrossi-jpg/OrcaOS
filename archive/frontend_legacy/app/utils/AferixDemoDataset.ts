import { db } from '../../storage/dexieDatabase';
import { generateUUID } from '../../core/utils/idGenerator';

/**
 * AFERIX RC1 REALISTIC DEMO DATASET
 * Target Region: São José do Rio Preto - SP
 * Business Context: Electrical, CFTV, HVAC (PMOC), and Field Service.
 * 
 * TARGET STATUS STRIP:
 * OS: 12
 * Pendências: 3
 * Receber: R$ 14.850
 * PMOC: 8
 */
export async function seedRealisticDemoData() {
  console.log('💎 Seeding Aferix RC1 High-Fidelity Reference Dataset...');

  const companyId = 'demo-company';
  const workspaceId = 'demo-workspace';
  const today = new Date().toISOString().slice(0, 10);

  // Helper for dates
  const daysAgo = (d: number) => {
    const date = new Date();
    date.setDate(date.getDate() - d);
    return date.toISOString();
  };
  
  const monthsAgo = (m: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - m);
    return date.toISOString();
  };

  // 1. CLEAR STAGE
  await Promise.all([
    db.clients.clear(),
    db.sites.clear(),
    db.assets.clear(),
    db.attendances.clear(),
    db.budgets.clear(),
    db.workOrders.clear(),
    db.simpleFinanceRecords.clear(),
    db.maintenancePlans.clear(),
    db.contracts.clear()
  ]);

  // 2. CLIENTS (15 High Fidelity)
  const clientProfiles = [
    { id: 'c1', name: 'Condomínio Vale Verde', type: 'Condomínio', address: 'Av. das Palmeiras, 1200, Damas', contact: 'Carlos Almeida', phone: '(17) 99111-1111' },
    { id: 'c2', name: 'Residencial Bosque Imperial', type: 'Condomínio', address: 'Rua das Flores, 450, Vivendas', contact: 'Maria Silva', phone: '(17) 99222-2222' },
    { id: 'c3', name: 'Clínica São Lucas', type: 'Comercial', address: 'Rua Voluntários de SP, 890, Centro', contact: 'Dr. Roberto', phone: '(17) 99333-3333' },
    { id: 'c4', name: 'Auto Center Rio Preto', type: 'Comercial', address: 'Av. Alberto Andaló, 2100', contact: 'Marcos Rezende', phone: '(17) 99444-4444' },
    { id: 'c5', name: 'Supermercado União', type: 'Comercial', address: 'Rua Siqueira Campos, 15, Boa Vista', contact: 'Joaquim Oliveira', phone: '(17) 99555-5555' },
    { id: 'c6', name: 'Escola Futuro', type: 'Comercial', address: 'Rua Benjamin Constant, 3200', contact: 'Prof. Ana', phone: '(17) 99666-6666' },
    { id: 'c7', name: 'Hospital Santa Helena', type: 'Comercial', address: 'Rua Marechal Deodoro, 1000', contact: 'Eng. André', phone: '(17) 99777-7777' },
    { id: 'c8', name: 'Condomínio Jardim Europa', type: 'Condomínio', address: 'Av. Juscelino K. de Oliveira, 5000', contact: 'Síndico Walter', phone: '(17) 99888-8888' },
    { id: 'c9', name: 'Posto Avenida', type: 'Comercial', address: 'Av. Bady Bassitt, 1500', contact: 'Ricardo', phone: '(17) 99999-9999' },
    { id: 'c10', name: 'Distribuidora Central', type: 'Comercial', address: 'Distrito Industrial, Galpão 4', contact: 'Sérgio', phone: '(17) 99123-4567' },
    { id: 'c11', name: 'Metalúrgica Progresso', type: 'Comercial', address: 'Av. Ernani Pires Domingues, 400', contact: 'Luiz', phone: '(17) 99234-5678' },
    { id: 'c12', name: 'Shopping Rio Preto Center', type: 'Comercial', address: 'Av. Brig. Faria Lima, 6363', contact: 'Adm. Cláudia', phone: '(17) 99345-6789' },
    { id: 'c13', name: 'Residencial Morada do Sol', type: 'Condomínio', address: 'Rua José Bonifácio, 120, Redentora', contact: 'Dona Helena', phone: '(17) 99456-7890' },
    { id: 'c14', name: 'Laboratório BioVida', type: 'Comercial', address: 'Rua XV de Novembro, 550', contact: 'Felipe', phone: '(17) 99567-8901' },
    { id: 'c15', name: 'Edifício Empresarial Prime', type: 'Comercial', address: 'Av. Murchid Homsi, 1100', contact: 'Portaria 24h', phone: '(17) 99678-9012' }
  ];

  for (const cp of clientProfiles) {
    await db.clients.add({
      ...cp,
      email: `${cp.id}@aferix-demo.com.br`,
      status: 'active',
      companyId,
      workspaceId,
      createdAt: daysAgo(180),
      updatedAt: daysAgo(5),
      syncStatus: 'synced'
    } as any);

    await db.sites.add({
      id: `s-${cp.id}`,
      clientId: cp.id,
      name: cp.type === 'Condomínio' ? 'Área Comum' : 'Sede Principal',
      address: cp.address,
      companyId,
      workspaceId,
      createdAt: daysAgo(180),
      updatedAt: daysAgo(5),
      syncStatus: 'synced'
    });
  }

  // 3. ASSETS
  const equipmentTypes = ['Split 24.000 BTU', 'Cassete 36.000 BTU', 'VRF System Unit', 'Quadro Elétrico T1', 'Câmera IP Speed Dome'];
  for (let i = 0; i < 40; i++) {
    const client = clientProfiles[i % 15];
    await db.assets.add({
      id: `asset-${i}`,
      clientId: client.id,
      siteId: `s-${client.id}`,
      name: equipmentTypes[i % equipmentTypes.length],
      category: i % 2 === 0 ? 'HVAC' : 'Electrical',
      status: 'operational',
      companyId,
      workspaceId,
      createdAt: daysAgo(180),
      updatedAt: daysAgo(10),
      syncStatus: 'synced'
    } as any);
  }

  // 4. BUDGETS (Target: 3 Pendencies)
  const budgetSpecs = [
    { title: 'Reforma Elétrica G-1', value: 12500, status: 'autorizado', client: 'c1' },
    { title: 'Cerca Elétrica Perimetral', value: 4500, status: 'autorizado', client: 'c2' },
    { title: 'Instalação Infra Ar Condicionado', value: 18500, status: 'autorizado', client: 'c3' },
    { title: 'Troca de Luminárias LED', value: 3400, status: 'autorizado', client: 'c8' },
    { title: 'Projeto Energia Solar', value: 24000, status: 'autorizado', client: 'c12' },
    
    // THE 3 PENDENCIES
    { title: 'Upgrade DVR 32 Canais', value: 4200, status: 'enviado', client: 'c9' },
    { title: 'Reparo Nobreak CPD', value: 950, status: 'em_revisao', client: 'c10' },
    { title: 'Vistoria Predial Elétrica', value: 3000, status: 'iniciado', client: 'c1' },

    { title: 'Manutenção Pára-raios', value: 5500, status: 'finalizado', client: 'c7' },
    { title: 'Pintura de Galpão', value: 12000, status: 'finalizado', client: 'c11' },
    { title: 'Gerador Estacionário 50kVA', value: 48000, status: 'recusado', client: 'c5' }
  ];

  for (const bs of budgetSpecs) {
    await db.budgets.add({
      id: generateUUID(),
      companyId,
      workspaceId,
      clientId: bs.client,
      siteId: `s-${bs.client}`,
      title: bs.title,
      status: bs.status as any,
      chargedValue: bs.value,
      items: [{ id: 'it1', description: 'Serviço Técnico Especializado', quantity: 1, unitPrice: bs.value, category: 'labor' }],
      createdAt: daysAgo(30),
      updatedAt: daysAgo(2),
      syncStatus: 'synced'
    } as any);
  }

  // 5. ATTENDANCES & WORK ORDERS (Target: 12 Active OS)
  // Active = 1 (Hero) + 2 (Prox) + 9 others (in-progress/scheduled)
  
  const technicians = ['Mateus Oliveira', 'Bruno Santos', 'Lucas Ferreira', 'André Lima'];

  // Hero - Active
  const heroAttId = 'att-active-hero';
  await db.attendances.add({
    id: heroAttId, clientId: 'c1', siteId: 's-c1', title: 'Instalação CFTV', status: 'EM_EXECUCAO' as any,
    companyId, workspaceId, scheduledDate: `${today}T09:30:00`, createdAt: daysAgo(2), updatedAt: `${today}T09:30:00`, syncStatus: 'synced'
  } as any);
  await db.workOrders.add({
    id: 'wo-active-hero', attendanceId: heroAttId, clientId: 'c1', siteId: 's-c1', title: 'Instalação CFTV', status: 'in-progress',
    companyId, workspaceId, scheduledDate: `${today}T09:30:00`, createdAt: daysAgo(2), updatedAt: `${today}T11:12:00`, syncStatus: 'synced', paymentStatus: 'pending', assignedTechnicianId: technicians[0]
  } as any);

  // Concluded early today
  const earlyAttId = 'att-done-today';
  await db.attendances.add({
    id: earlyAttId, clientId: 'c2', siteId: 's-c2', title: 'Checkup Semanal Bosque', status: 'FINALIZADO' as any,
    companyId, workspaceId, scheduledDate: `${today}T08:00:00`, createdAt: daysAgo(1), updatedAt: `${today}T09:15:00`, syncStatus: 'synced'
  } as any);
  await db.workOrders.add({
    id: 'wo-done-today', attendanceId: earlyAttId, clientId: 'c2', siteId: 's-c2', title: 'Checkup Semanal Bosque', status: 'done',
    companyId, workspaceId, scheduledDate: `${today}T08:00:00`, createdAt: daysAgo(1), updatedAt: `${today}T09:15:00`, syncStatus: 'synced', paymentStatus: 'paid', executedValue: 450, assignedTechnicianId: technicians[1]
  } as any);

  // Next 1
  const prox1AttId = 'att-prox-1';
  await db.attendances.add({
    id: prox1AttId, clientId: 'c3', siteId: 's-c3', title: 'Manutenção Preventiva', status: 'AGENDADO' as any,
    companyId, workspaceId, scheduledDate: `${today}T14:30:00`, createdAt: daysAgo(3), updatedAt: daysAgo(1), syncStatus: 'synced'
  } as any);
  await db.workOrders.add({
    id: 'wo-prox-1', attendanceId: prox1AttId, clientId: 'c3', siteId: 's-c3', title: 'Manutenção Preventiva', status: 'scheduled',
    companyId, workspaceId, scheduledDate: `${today}T14:30:00`, createdAt: daysAgo(3), updatedAt: daysAgo(1), syncStatus: 'synced', paymentStatus: 'pending', assignedTechnicianId: technicians[2]
  } as any);

  // Next 2
  const prox2AttId = 'att-prox-2';
  await db.attendances.add({
    id: prox2AttId, clientId: 'c5', siteId: 's-c5', title: 'Inspeção PMOC', status: 'AGENDADO' as any,
    companyId, workspaceId, scheduledDate: `${today}T17:00:00`, createdAt: daysAgo(5), updatedAt: daysAgo(1), syncStatus: 'synced'
  } as any);
  await db.workOrders.add({
    id: 'wo-prox-2', attendanceId: prox2AttId, clientId: 'c5', siteId: 's-c5', title: 'Inspeção PMOC', status: 'scheduled',
    companyId, workspaceId, scheduledDate: `${today}T17:00:00`, createdAt: daysAgo(5), updatedAt: daysAgo(1), syncStatus: 'synced', paymentStatus: 'pending', assignedTechnicianId: technicians[3]
  } as any);

  // Fill up to reach exactly 12 Active OS (in-progress + scheduled)
  // Current active = 1 (Hero) + 2 (Prox) = 3. Need 9 more.
  for (let i = 0; i < 9; i++) {
    const client = clientProfiles[(i + 6) % 15];
    await db.workOrders.add({
      id: generateUUID(),
      clientId: client.id,
      siteId: `s-${client.id}`,
      title: `OS Extra ${i + 1} - ${client.name}`,
      status: i < 5 ? 'in-progress' : 'scheduled',
      companyId,
      workspaceId,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
      syncStatus: 'synced',
      paymentStatus: 'pending',
      executedValue: 1500,
      assignedTechnicianId: technicians[i % 4]
    } as any);
  }

  // Add 9 more completed to reach 10 total completed
  for (let i = 0; i < 9; i++) {
    const client = clientProfiles[(i + 2) % 15];
    await db.workOrders.add({
      id: generateUUID(),
      clientId: client.id,
      siteId: `s-${client.id}`,
      title: `Serviço Concluído ${i + 1}`,
      status: 'done',
      companyId,
      workspaceId,
      createdAt: monthsAgo(1),
      updatedAt: daysAgo(10),
      syncStatus: 'synced',
      paymentStatus: 'paid',
      executedValue: 2200
    } as any);
  }

  // 6. FINANCE (Target: Receber R$ 14.850, Received R$ 21.300)
  // Receivables = 14.850
  await db.simpleFinanceRecords.add({
    id: generateUUID(), companyId, workspaceId, title: 'Parcela Pendente Grande Obra', clientId: 'c12', clientName: 'Shopping RP',
    status: 'pending', workOrderId: generateUUID(), expectedValue: 14850, receivedValue: 0, openBalance: 14850,
    materialCost: 0, travelCost: 0, cardFee: 0, estimatedTax: 0, otherCosts: 0, createdAt: daysAgo(5), updatedAt: daysAgo(5)
  });

  // Monthly Received = 21.300 (Sum of paid records this month)
  for (let i = 0; i < 5; i++) {
    await db.simpleFinanceRecords.add({
      id: generateUUID(), companyId, workspaceId, title: `Recebimento Ref. OS ${100+i}`, clientId: 'c3', clientName: 'Clínica São Lucas',
      status: 'paid', workOrderId: generateUUID(), expectedValue: 4260, receivedValue: 4260, openBalance: 0,
      materialCost: 500, travelCost: 100, cardFee: 80, estimatedTax: 200, otherCosts: 0, createdAt: daysAgo(15), updatedAt: daysAgo(14)
    });
  }

  // History (6 Months)
  for (let m = 1; m <= 6; m++) {
    await db.simpleFinanceRecords.add({
      id: generateUUID(), companyId, workspaceId, title: `Fechamento Mês -${m}`, clientId: 'c1', clientName: 'Vale Verde',
      status: 'paid', workOrderId: generateUUID(), expectedValue: 18000 + (m * 1000), receivedValue: 18000 + (m * 1000), openBalance: 0,
      materialCost: 2000, travelCost: 500, cardFee: 300, estimatedTax: 1000, otherCosts: 0, createdAt: monthsAgo(m), updatedAt: monthsAgo(m)
    });
  }

  // 7. PMOC (Target: 8 Active Plans)
  for (let i = 0; i < 8; i++) {
    const client = clientProfiles[i % 15];
    await db.maintenancePlans.add({
      id: generateUUID(), companyId, workspaceId, clientId: client.id, siteId: `s-${client.id}`,
      title: `PMOC - ${client.name} (${equipmentTypes[i % equipmentTypes.length]})`,
      frequency: 'monthly', nextExecutionDate: i < 2 ? today : (i < 5 ? daysAgo(-7).slice(0,10) : daysAgo(-30).slice(0,10)),
      isActive: true, createdAt: daysAgo(180), updatedAt: daysAgo(5), syncStatus: 'synced'
    });
  }

  // 8. CONTRACTS (12 Contracts)
  const frequencies = ['monthly', 'quarterly', 'semiannual', 'annual'];
  for (let i = 0; i < 12; i++) {
    const client = clientProfiles[i % 15];
    await db.contracts.add({
      id: generateUUID(), companyId, workspaceId, clientId: client.id, title: `Contrato Corporate - ${client.name}`,
      status: 'active', startDate: monthsAgo(12), billingFrequency: frequencies[i % 4] as any,
      billingAmount: 1850 + (i * 450), siteIds: [`s-${client.id}`], assetIds: [], maintenancePlanIds: [],
      createdAt: monthsAgo(12), updatedAt: daysAgo(2), syncStatus: 'synced'
    });
  }

  console.log('✅ High-fidelity demo data seeded successfully.');
  window.dispatchEvent(new Event('aferix_data_updated'));
}
