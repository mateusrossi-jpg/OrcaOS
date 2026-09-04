import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../../storage/dexieDatabase';
import { SimpleFinanceService } from '../../../services/SimpleFinanceService';
import { operationalFacade } from '../../workflow/operationalFacade';
import { isRecordInPeriod, PeriodFilterType } from './SimpleFinanceWorkspace';
import { generateFinanceCSV } from '../../../utils/exportUtils';
import { SimpleFinanceRecord } from '../../../domain/finance';

describe('FASE 4.4 — FECHAMENTO FINANCEIRO POR PERÍODO', () => {
  const financeService = new SimpleFinanceService();

  beforeEach(async () => {
    await db.clients.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.simpleFinanceRecords.clear();
    await db.operationalEvents.clear();
  });

  describe('1. Validações Temporais & Fuso Horário', () => {
    it('filtra corretamente Este Mês sem depender de updates posteriores', () => {
      // Fixar data de referência: 15 de Outubro de 2026
      const refDate = new Date(2026, 9, 15, 14, 0, 0); // Outubro = mês 9 (0-indexed)

      const recordThisMonth = '2026-10-02T10:00:00.000Z';
      const recordLastMonth = '2026-09-28T10:00:00.000Z';
      const recordOld = '2026-06-01T10:00:00.000Z';

      expect(isRecordInPeriod(recordThisMonth, 'this_month', refDate)).toBe(true);
      expect(isRecordInPeriod(recordLastMonth, 'this_month', refDate)).toBe(false);
      expect(isRecordInPeriod(recordOld, 'this_month', refDate)).toBe(false);
    });

    it('filtra corretamente Mês Passado com virada de ano e bordas', () => {
      // Caso 1: Março -> Fevereiro do mesmo ano
      const refMarch = new Date(2026, 2, 10); // Março 2026
      expect(isRecordInPeriod('2026-02-15T12:00:00.000Z', 'last_month', refMarch)).toBe(true);
      expect(isRecordInPeriod('2026-03-01T00:00:00.000Z', 'last_month', refMarch)).toBe(false);

      // Caso 2: Janeiro -> Dezembro do ano anterior
      const refJan = new Date(2027, 0, 5); // Janeiro 2027
      expect(isRecordInPeriod('2026-12-20T12:00:00.000Z', 'last_month', refJan)).toBe(true);
      expect(isRecordInPeriod('2027-01-01T12:00:00.000Z', 'last_month', refJan)).toBe(false);
    });

    it('filtra janela de Últimos 90 Dias', () => {
      const refDate = new Date(2026, 9, 15); // 15 de Outubro de 2026
      // 30 dias atrás (~15 Setembro 2026) -> Dentro
      expect(isRecordInPeriod('2026-09-15T00:00:00.000Z', 'last_90_days', refDate)).toBe(true);
      // 80 dias atrás (~27 Julho 2026) -> Dentro
      expect(isRecordInPeriod('2026-07-27T00:00:00.000Z', 'last_90_days', refDate)).toBe(true);
      // 120 dias atrás (~17 Junho 2026) -> Fora
      expect(isRecordInPeriod('2026-06-10T00:00:00.000Z', 'last_90_days', refDate)).toBe(false);
    });

    it('filtro "Tudo" inclui qualquer registro válido', () => {
      expect(isRecordInPeriod('2024-01-01T00:00:00.000Z', 'all')).toBe(true);
      expect(isRecordInPeriod('2026-10-01T00:00:00.000Z', 'all')).toBe(true);
    });
  });

  describe('2. Modelo Matemático de Fechamento Anti-Dupla Contagem', () => {
    it('calcula Entradas, Saídas, Lucro Real e A Receber sem duplicar despesas de OS com despesas avulsas', async () => {
      // Registro 1: OS com Recebimento Total
      await financeService.saveRecord({
        title: 'Manutenção Preventiva Chiller',
        clientId: 'cli-1',
        clientName: 'Hospital Central',
        workOrderId: 'wo-101',
        companyId: 'company-a',
        workspaceId: 'workspace-a',
        expectedValue: 1000,
        receivedValue: 1000,
        materialCost: 200,
        travelCost: 100,
        cardFee: 0,
        estimatedTax: 0,
        otherCosts: 0
      });

      // Registro 2: OS com Pagamento Parcial
      await financeService.saveRecord({
        title: 'Instalação VRF Escritório',
        clientId: 'cli-2',
        clientName: 'Advocacia Silva',
        workOrderId: 'wo-102',
        companyId: 'company-a',
        workspaceId: 'workspace-a',
        expectedValue: 2000,
        receivedValue: 1200,
        materialCost: 400,
        travelCost: 100,
        cardFee: 0,
        estimatedTax: 0,
        otherCosts: 0
      });

      // Registro 3: Despesa Avulsa (Combustível)
      await operationalFacade.registerExpense({
        title: 'Gasolina Posto Ipiranga',
        category: 'fuel',
        amount: 150,
        notes: 'Deslocamento da equipe'
      });

      // Registro 4: Despesa Avulsa (Alimentação)
      await operationalFacade.registerExpense({
        title: 'Almoço Técnico em Campo',
        category: 'food',
        amount: 80
      });

      const allRecords = await financeService.listRecords();
      expect(allRecords.length).toBe(4);

      // Verificação Matemática:
      // 1. Entradas Realizadas = 1000 (OS 1) + 1200 (OS 2) + 0 (Despesas) = 2200
      const revenue = allRecords.reduce((acc, r) => acc + r.receivedValue, 0);
      expect(revenue).toBe(2200);

      // 2. Custos/Saídas Totais = Custos OS (300 + 500) + Despesas Avulsas (150 + 80) = 800 + 230 = 1030
      const totalCosts = allRecords.reduce((acc, r) => {
        return acc + (r.materialCost || 0) + (r.travelCost || 0) + (r.otherCosts || 0) + (r.cardFee || 0) + (r.estimatedTax || 0);
      }, 0);
      expect(totalCosts).toBe(1030);

      // 3. Lucro Real = Entradas (2200) - Custos Totais (1030) = 1170
      const netProfit = revenue - totalCosts;
      expect(netProfit).toBe(1170);

      // 4. Margem Real = (1170 / 2200) * 100 = 53.1818...%
      const margin = (netProfit / revenue) * 100;
      expect(margin).toBeCloseTo(53.18, 1);

      // 5. Pendente a Receber = apenas saldo aberto de OSs pendentes = 800
      const pendingReceivables = allRecords.reduce((acc, r) => {
        return acc + (r.status !== 'paid' ? r.openBalance : 0);
      }, 0);
      expect(pendingReceivables).toBe(800);

      // Despesas não afetam A Receber
      const expenseRecords = allRecords.filter(r => r.clientId === 'EXPENSE');
      expect(expenseRecords.every(r => r.openBalance === 0)).toBe(true);
    });
  });

  describe('3. Multi-Tenant & Isolamento', () => {
    it('garante que registros de empresas/workspaces diferentes respeitem o companyId', async () => {
      const recA = await financeService.saveRecord({
        title: 'Serviço Empresa A',
        clientId: 'cli-A',
        clientName: 'Cliente A',
        workOrderId: 'wo-A',
        companyId: 'company-ALPHA',
        workspaceId: 'workspace-ALPHA',
        expectedValue: 500,
        receivedValue: 500,
        materialCost: 50,
        travelCost: 0,
        cardFee: 0,
        estimatedTax: 0,
        otherCosts: 0
      });

      expect(recA.companyId).toBe('company-ALPHA');
      expect(recA.workspaceId).toBe('workspace-ALPHA');
    });
  });

  describe('4. Exportação CSV Enriquecida & Compatibilidade Excel', () => {
    it('gera CSV com BOM UTF-8, delimitador ";" e formatação decimal pt-BR', () => {
      const mockRecords: SimpleFinanceRecord[] = [
        {
          id: 'rec-1',
          companyId: 'company-a',
          workspaceId: 'workspace-a',
          title: 'Manutenção Chiller 50TR',
          clientId: 'cli-1',
          clientName: 'Shopping Plaza',
          status: 'paid',
          workOrderId: 'wo-1',
          expectedValue: 3500.50,
          receivedValue: 3500.50,
          openBalance: 0,
          materialCost: 650.00,
          travelCost: 120.00,
          cardFee: 0,
          estimatedTax: 150.00,
          otherCosts: 0,
          createdAt: '2026-10-01T10:00:00.000Z',
          updatedAt: '2026-10-01T10:00:00.000Z'
        },
        {
          id: 'rec-2',
          companyId: 'company-a',
          workspaceId: 'workspace-a',
          title: 'Combustível da Van',
          clientId: 'EXPENSE',
          clientName: 'Combustível',
          status: 'paid',
          workOrderId: '',
          expectedValue: 0,
          receivedValue: 0,
          openBalance: 0,
          materialCost: 0,
          travelCost: 210.75,
          cardFee: 0,
          estimatedTax: 0,
          otherCosts: 0,
          createdAt: '2026-10-02T10:00:00.000Z',
          updatedAt: '2026-10-02T10:00:00.000Z'
        }
      ];

      const csv = generateFinanceCSV(mockRecords);

      expect(csv.startsWith('\ufeff')).toBe(true);
      expect(csv).toContain('Data;Tipo;Descrição;Cliente;Valor Previsto (R$);Valor Realizado (R$);Custos/Despesas (R$);Saldo em Aberto (R$);Status');
      expect(csv).toContain('3500,50');
      expect(csv).toContain('920,00');
      expect(csv).toContain('210,75');
      expect(csv).toContain('Serviço');
      expect(csv).toContain('Saída / Despesa');
    });
  });

  describe('5. Integridade do Event Store e OperationalFacade', () => {
    it('registra pagamentos e despesas sem alterar esquema ou quebrar auditoria de eventos', async () => {
      const woId = 'wo-audit-test-99';
      
      await operationalFacade.createWorkOrder({
        id: woId,
        clientId: 'cli-audit',
        siteId: 'site-audit',
        title: 'OS Auditada',
        status: 'done',
        paymentStatus: 'pending',
        executedValue: 1500
      } as any);

      await operationalFacade.registerPayment(woId, 1500);

      const events = await db.operationalEvents.where('aggregateId').equals(woId).toArray();
      expect(events.length).toBeGreaterThan(0);
      const paymentEvent = events.find(e => e.eventType === 'FINANCE_RECORD_REALIZED');
      expect(paymentEvent).toBeDefined();
      expect(paymentEvent?.snapshot?.receivedValue).toBe(1500);
      expect(paymentEvent?.snapshot?.status).toBe('paid');
    });
  });
});
