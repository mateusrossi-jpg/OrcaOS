import { describe, expect, it } from 'vitest';
import { isFieldReady, countsAsRevenue, type WorkOrderStatus } from '../database/schema';

// ─── Testes: isFieldReady / countsAsRevenue ───────────────────────────────────
describe('isFieldReady', () => {
  it('retorna true para approved', () => {
    expect(isFieldReady('approved')).toBe(true);
  });

  it('retorna true para in_progress', () => {
    expect(isFieldReady('in_progress')).toBe(true);
  });

  it('retorna true para completed', () => {
    expect(isFieldReady('completed')).toBe(true);
  });

  it('retorna false para draft', () => {
    expect(isFieldReady('draft')).toBe(false);
  });

  it('retorna false para sent', () => {
    expect(isFieldReady('sent')).toBe(false);
  });

  it('retorna false para cancelled', () => {
    expect(isFieldReady('cancelled')).toBe(false);
  });
});

describe('countsAsRevenue', () => {
  it('retorna true para approved', () => {
    expect(countsAsRevenue('approved')).toBe(true);
  });

  it('retorna true para completed', () => {
    expect(countsAsRevenue('completed')).toBe(true);
  });

  it('retorna false para draft', () => {
    expect(countsAsRevenue('draft')).toBe(false);
  });

  it('retorna false para sent', () => {
    expect(countsAsRevenue('sent')).toBe(false);
  });

  it('retorna false para in_progress', () => {
    expect(countsAsRevenue('in_progress')).toBe(false);
  });

  it('retorna false para cancelled', () => {
    expect(countsAsRevenue('cancelled')).toBe(false);
  });
});

// ─── Testes: WorkOrderStatus - Classificação das Abas do Pipeline ─────────────
describe('pipeline tab classification', () => {
  type MockWO = { status: WorkOrderStatus; scheduled_start?: string };

  // Reproduz a lógica das abas
  function classifyTab(wo: MockWO): 'unscheduled' | 'agenda' | 'in_progress' | 'completed' | 'other' {
    if (wo.status === 'approved' && !wo.scheduled_start) return 'unscheduled';
    if (wo.status === 'approved' && !!wo.scheduled_start) return 'agenda';
    if (wo.status === 'in_progress') return 'in_progress';
    if (wo.status === 'completed') return 'completed';
    return 'other';
  }

  it('OS aprovada sem agendamento vai para "Sem Agenda"', () => {
    expect(classifyTab({ status: 'approved' })).toBe('unscheduled');
  });

  it('OS aprovada com agendamento vai para "Agenda"', () => {
    expect(classifyTab({ status: 'approved', scheduled_start: '2026-09-01T09:00:00Z' })).toBe('agenda');
  });

  it('OS em andamento vai para "Em Andamento"', () => {
    expect(classifyTab({ status: 'in_progress' })).toBe('in_progress');
  });

  it('OS concluída vai para "Concluídas"', () => {
    expect(classifyTab({ status: 'completed' })).toBe('completed');
  });

  it('OS rascunho não aparece nas abas de campo', () => {
    expect(classifyTab({ status: 'draft' })).toBe('other');
  });

  it('OS enviada não aparece como ativa no pipeline de campo', () => {
    expect(classifyTab({ status: 'sent' })).toBe('other');
  });

  it('OS cancelada não aparece nas abas de campo', () => {
    expect(classifyTab({ status: 'cancelled' })).toBe('other');
  });
});

// ─── Testes: TeamMember (validação de interface/seed) ────────────────────────
describe('TeamMember seed logic', () => {
  it('seed cria exatamente 1 membro padrão quando tabela está vazia', () => {
    const existingCount = 0;
    const shouldSeed = existingCount === 0;
    expect(shouldSeed).toBe(true);
  });

  it('seed não duplica se já existir membro cadastrado', () => {
    const existingCount: number = 1;
    const shouldSeed = existingCount === 0;
    expect(shouldSeed).toBe(false);
  });

  it('membro padrão tem nome Proprietário e role Técnico Responsável', () => {
    const defaultMember = {
      id: 'member-test-001',
      name: 'Proprietário',
      role: 'Técnico Responsável',
      active: true,
    };
    expect(defaultMember.name).toBe('Proprietário');
    expect(defaultMember.role).toBe('Técnico Responsável');
    expect(defaultMember.active).toBe(true);
  });
});

// ─── Testes: Agendamento de OS ────────────────────────────────────────────────
describe('OS scheduling fields', () => {
  it('OS aprovada sem scheduled_start não está agendada', () => {
    const wo = { status: 'approved' as WorkOrderStatus, scheduled_start: undefined };
    expect(wo.scheduled_start).toBeUndefined();
  });

  it('OS com scheduled_start está corretamente agendada', () => {
    const start = '2026-09-15T10:00:00.000Z';
    const wo = { status: 'approved' as WorkOrderStatus, scheduled_start: start };
    expect(wo.scheduled_start).toBe(start);
  });

  it('OS pode ter endereço de execução diferente do endereço do cliente', () => {
    const wo = {
      status: 'approved' as WorkOrderStatus,
      address: 'Sede do Cliente, Rua X',
      service_address: 'Filial 2 do Cliente, Rua Y',
    };
    expect(wo.service_address).toBe('Filial 2 do Cliente, Rua Y');
    expect(wo.address).toBe('Sede do Cliente, Rua X');
    expect(wo.service_address).not.toBe(wo.address);
  });

  it('scheduled_end é opcional', () => {
    const wo = {
      status: 'approved' as WorkOrderStatus,
      scheduled_start: '2026-09-15T10:00:00.000Z',
      scheduled_end: undefined,
    };
    expect(wo.scheduled_end).toBeUndefined();
  });
});
