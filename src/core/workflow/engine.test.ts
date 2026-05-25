import { describe, it, expect } from 'vitest';
import { validateTransition, getActionBlockReason, ALLOWED_TRANSITIONS } from './engine';

describe('Workflow Engine', () => {
  describe('validateTransition', () => {
    it('allows valid transitions by status', () => {
      expect(validateTransition('iniciado', 'enviado', 'admin')).toBe(true);
      expect(validateTransition('em_revisao', 'enviado', 'admin')).toBe(true);
      expect(validateTransition('enviado', 'autorizado', 'admin')).toBe(true);
      expect(validateTransition('autorizado', 'em_execucao', 'admin')).toBe(true);
      expect(validateTransition('em_execucao', 'finalizado', 'admin')).toBe(true);
      expect(validateTransition('finalizado', 'arquivado', 'admin')).toBe(true);
    });

    it('blocks invalid transitions', () => {
      // Missing intermediate states
      expect(validateTransition('iniciado', 'autorizado', 'admin')).toBe(false);
      expect(validateTransition('enviado', 'em_execucao', 'admin')).toBe(false);
      expect(validateTransition('finalizado', 'autorizado', 'admin')).toBe(false);
    });

    it('blocks certain roles correctly (architecture proof)', () => {
      expect(validateTransition('em_execucao', 'finalizado', 'technician')).toBe(false);
    });
  });

  describe('getActionBlockReason', () => {
    it('allows critical and operational edits on early stages', () => {
      expect(getActionBlockReason('iniciado', 'canEditCriticalValues')).toBeNull();
      expect(getActionBlockReason('iniciado', 'canEditOperational')).toBeNull();
      expect(getActionBlockReason('em_revisao', 'canEditCriticalValues')).toBeNull();
    });

    it('blocks critical values editing after sending to client', () => {
      const reasonSent = getActionBlockReason('enviado', 'canEditCriticalValues');
      expect(reasonSent).toBe('Valores bloqueados. O orçamento já avançou no fluxo operacional.');

      const reasonAuth = getActionBlockReason('autorizado', 'canEditCriticalValues');
      expect(reasonAuth).toBe('Valores bloqueados. O orçamento já avançou no fluxo operacional.');
      
      const reasonExec = getActionBlockReason('em_execucao', 'canEditCriticalValues');
      expect(reasonExec).toBe('Valores bloqueados. O orçamento já avançou no fluxo operacional.');
    });

    it('blocks operational edits after finalized', () => {
      const reasonFin = getActionBlockReason('finalizado', 'canEditOperational');
      expect(reasonFin).toBe('Orçamento finalizado ou arquivado. Edição bloqueada.');
      
      const reasonArch = getActionBlockReason('arquivado', 'canEditOperational');
      expect(reasonArch).toBe('Orçamento finalizado ou arquivado. Edição bloqueada.');
    });

    it('returns unknown state reason if state does not exist', () => {
      expect(getActionBlockReason('desconhecido', 'canEditCriticalValues')).toBe('Estado desconhecido.');
    });
  });
});
