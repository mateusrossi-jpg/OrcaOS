import { db } from '../../storage/dexieDatabase';
import { BUDGET_STATUS } from '../../domain/budget';
import { generateUUID } from '../../core/utils/idGenerator';

/**
 * AFERIX RC1 REFERENCE DATASET
 * Populates the system with realistic business data for visual validation.
 */
export async function seedDemoData() {
  console.log('🌱 Seeding Aferix RC1 Reference Dataset...');

  // 1. Clear existing data to avoid duplicates/junk
  await Promise.all([
    db.clients.clear(),
    db.attendances.clear(),
    db.budgets.clear(),
    db.workOrders.clear(),
    db.simpleFinanceRecords.clear(),
    db.maintenancePlans.clear(),
    db.sites.clear(),
    db.assets.clear()
  ]);

  const companyId = 'demo-company';
  const workspaceId = 'demo-workspace';
  const today = new Date().toISOString().slice(0, 10);

  // 2. Clients & Sites
  const clients = [
    { id: 'c1', name: 'Condomínio Vale Verde', type: 'Condomínio', address: 'Av. das Palmeiras, 1200', contact: 'Carlos Almeida', phone: '(17) 99111-1111' },
    { id: 'c2', name: 'Residencial Bosque Imperial', type: 'Residencial', address: 'Rua das Flores, 450', contact: 'Maria Silva', phone: '(17) 99222-2222' },
    { id: 'c3', name: 'Clínica São Lucas', type: 'Comercial', address: 'Rua Voluntários, 890', contact: 'Dr. Roberto', phone: '(17) 99333-3333' },
    { id: 'c4', name: 'Auto Center Rio Preto', type: 'Comercial', address: 'Av. Alberto Andaló, 2100', contact: 'Marcos', phone: '(17) 99444-4444' },
    { id: 'c5', name: 'Supermercado União', type: 'Comercial', address: 'Rua Siqueira Campos, 15', contact: 'Joaquim', phone: '(17) 99555-5555' }
  ];

  for (const c of clients) {
    await db.clients.add({
      ...c,
      companyId,
      workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced'
    } as any);

    await db.sites.add({
      id: `s-${c.id}`,
      clientId: c.id,
      name: 'Sede Principal',
      address: c.address,
      companyId,
      workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced'
    });
  }

  // 3. Budgets
  const budgetData = [
    { status: 'autorizado', value: 12500, title: 'Reforma Elétrica G-1' },
    { status: 'autorizado', value: 3400, title: 'Troca de Luminárias' },
    { status: 'autorizado', value: 8500, title: 'Instalação Ar Condicionado' },
    { status: 'autorizado', value: 1200, title: 'Manutenção Corretiva' },
    { status: 'autorizado', value: 18000, title: 'Projeto Solar' },
    { status: 'em_revisao', value: 4500, title: 'Cerca Elétrica' },
    { status: 'em_revisao', value: 920, title: 'Interfonia Digital' },
    { status: 'iniciado', value: 1500, title: 'Pintura Fachada' },
    { status: 'recusado', value: 7500, title: 'Gerador Diesel' },
    { status: 'recusado', value: 800, title: 'Pequenos Reparos' }
  ];

  for (const b of budgetData) {
    await db.budgets.add({
      id: generateUUID(),
      companyId,
      workspaceId,
      clientId: clients[Math.floor(Math.random() * clients.length)].id,
      siteId: `s-c1`,
      title: b.title,
      status: b.status as any,
      chargedValue: b.value,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced'
    } as any);
  }

  // 4. Attendances & Work Orders
  // Active: Instalação CFTV (Condomínio Vale Verde)
  const activeAttId = generateUUID();
  await db.attendances.add({
    id: activeAttId,
    clientId: 'c1',
    siteId: 's-c1',
    title: 'Instalação CFTV',
    status: 'EM_EXECUCAO' as any,
    companyId,
    workspaceId,
    scheduledDate: `${today}T09:30:00`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced'
  } as any);

  const activeWOId = generateUUID();
  await db.workOrders.add({
    id: activeWOId,
    attendanceId: activeAttId,
    clientId: 'c1',
    siteId: 's-c1',
    title: 'Instalação CFTV',
    status: 'in-progress',
    companyId,
    workspaceId,
    scheduledDate: `${today}T09:30:00`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced',
    paymentStatus: 'pending'
  } as any);

  // Upcoming: Manutenção Preventiva (Clínica São Lucas)
  const up1AttId = generateUUID();
  await db.attendances.add({
    id: up1AttId,
    clientId: 'c3',
    siteId: 's-c3',
    title: 'Manutenção Preventiva',
    status: 'AGENDADO' as any,
    companyId,
    workspaceId,
    scheduledDate: `${today}T14:30:00`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced'
  } as any);

  await db.workOrders.add({
    id: generateUUID(),
    attendanceId: up1AttId,
    clientId: 'c3',
    siteId: 's-c3',
    title: 'Manutenção Preventiva',
    status: 'scheduled',
    companyId,
    workspaceId,
    scheduledDate: `${today}T14:30:00`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced',
    paymentStatus: 'pending'
  } as any);

  // Upcoming: Inspeção PMOC (Supermercado União)
  const up2AttId = generateUUID();
  await db.attendances.add({
    id: up2AttId,
    clientId: 'c5',
    siteId: 's-c5',
    title: 'Inspeção PMOC',
    status: 'AGENDADO' as any,
    companyId,
    workspaceId,
    scheduledDate: `${today}T17:00:00`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced'
  } as any);

  await db.workOrders.add({
    id: generateUUID(),
    attendanceId: up2AttId,
    clientId: 'c5',
    siteId: 's-c5',
    title: 'Inspeção PMOC',
    status: 'scheduled',
    companyId,
    workspaceId,
    scheduledDate: `${today}T17:00:00`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced',
    paymentStatus: 'pending'
  } as any);

  // Concluded: Checkup Semanal
  const concAttId = generateUUID();
  await db.attendances.add({
    id: concAttId,
    clientId: 'c2',
    siteId: 's-c2',
    title: 'Checkup Semanal',
    status: 'FINALIZADO' as any,
    companyId,
    workspaceId,
    scheduledDate: `${today}T08:00:00`,
    createdAt: new Date().toISOString(),
    updatedAt: `${today}T09:00:00`,
    syncStatus: 'synced'
  } as any);

  await db.workOrders.add({
    id: generateUUID(),
    attendanceId: concAttId,
    clientId: 'c2',
    siteId: 's-c2',
    title: 'Checkup Semanal',
    status: 'done',
    companyId,
    workspaceId,
    scheduledDate: `${today}T08:00:00`,
    createdAt: new Date().toISOString(),
    updatedAt: `${today}T09:00:00`,
    syncStatus: 'synced',
    paymentStatus: 'paid',
    executedValue: 450
  } as any);

  // Add remaining Work Orders to reach 12
  for (let i = 0; i < 8; i++) {
    const status = i < 4 ? 'in-progress' : 'done';
    await db.workOrders.add({
      id: generateUUID(),
      clientId: clients[i % 5].id,
      title: `Serviço Extra ${i + 1}`,
      status: status as any,
      companyId,
      workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced',
      paymentStatus: status === 'done' ? 'paid' : 'pending',
      executedValue: 800 + (i * 200)
    } as any);
  }

  // 5. Finance
  // Receivable: R$ 14.800 (Pending + Partial)
  // Paid this month: R$ 21.300
  // Pending: R$ 3.400 (Delayed)
  
  const financeRecords = [
    { title: 'Parcela 1/3 - Reforma G-1', status: 'partial', expected: 5000, received: 2000, open: 3000 },
    { title: 'Instalação Ar Condicionado', status: 'pending', expected: 8500, received: 0, open: 8500 },
    { title: 'Manutenção PMOC Junho', status: 'pending', expected: 3300, received: 0, open: 3300 },
    { title: 'Projeto Solar (Entrada)', status: 'paid', expected: 18000, received: 18000, open: 0 },
    { title: 'Troca Luminárias', status: 'paid', expected: 3300, received: 3300, open: 0 },
    { title: 'Atrasado - Reparo Abril', status: 'pending', expected: 3400, received: 0, open: 3400 }
  ];

  for (const f of financeRecords) {
    await db.simpleFinanceRecords.add({
      id: generateUUID(),
      companyId,
      workspaceId,
      title: f.title,
      clientId: clients[0].id,
      clientName: clients[0].name,
      status: f.status as any,
      workOrderId: generateUUID(),
      expectedValue: f.expected,
      receivedValue: f.received,
      openBalance: f.open,
      materialCost: 0,
      travelCost: 0,
      cardFee: 0,
      estimatedTax: 0,
      otherCosts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // 6. PMOC
  for (let i = 0; i < 8; i++) {
    await db.maintenancePlans.add({
      id: generateUUID(),
      companyId,
      workspaceId,
      clientId: clients[i % 5].id,
      siteId: `s-${clients[i % 5].id}`,
      title: `Plano PMOC - ${clients[i % 5].name}`,
      frequency: 'monthly',
      nextExecutionDate: i < 2 ? today : (i < 5 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced'
    });
  }

  console.log('✅ Demo data seeded successfully.');
  window.dispatchEvent(new Event('aferix_data_updated'));
}
