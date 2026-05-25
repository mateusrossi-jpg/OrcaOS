import { describe, it, expect, vi } from 'vitest';
import { BudgetActionsBar } from './BudgetActionsBar';
import React from 'react';

function flattenChildrenText(children: any): string {
  if (!children) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    return children.map(flattenChildrenText).join('');
  }
  if (children.props && children.props.children) {
    return flattenChildrenText(children.props.children);
  }
  return '';
}

function findButtonsLabels(element: any): string[] {
  if (!element || typeof element !== 'object') return [];
  const labels: string[] = [];
  
  if (element.props && element.props.children) {
    // If it's a button component, its children is usually the label text
    if (typeof element.type === 'function' && (element.type.name === 'PrimaryButton' || element.type.name === 'SecondaryButton')) {
      const text = flattenChildrenText(element.props.children);
      labels.push(text);
    } else {
      const childrenArr = Array.isArray(element.props.children) ? element.props.children : [element.props.children];
      for (const child of childrenArr) {
        labels.push(...findButtonsLabels(child));
      }
    }
  }
  return labels;
}

function findButtonAndClick(element: any, label: string) {
  if (!element || typeof element !== 'object') return false;
  
  if (element.props && element.props.children) {
    if (typeof element.type === 'function' && (element.type.name === 'PrimaryButton' || element.type.name === 'SecondaryButton')) {
      const text = flattenChildrenText(element.props.children);
      if (text === label && element.props.onClick) {
        element.props.onClick();
        return true;
      }
    } else {
      const childrenArr = Array.isArray(element.props.children) ? element.props.children : [element.props.children];
      for (const child of childrenArr) {
        if (findButtonAndClick(child, label)) return true;
      }
    }
  }
  return false;
}

function findLockIndicatorText(element: any): string | null {
  if (!element || typeof element !== 'object') return null;
  
  if (element.props && element.props.className && typeof element.props.className === 'string' && element.props.className.includes('lockIndicator')) {
    // Found the lock indicator div, let's extract text
    return flattenChildrenText(element.props.children);
  }
  
  if (element.props && element.props.children) {
    const childrenArr = Array.isArray(element.props.children) ? element.props.children : [element.props.children];
    for (const child of childrenArr) {
      const text = findLockIndicatorText(child);
      if (text) return text;
    }
  }
  return null;
}

describe('BudgetActionsBar (Workflow Transitions)', () => {
  it('renders only valid transition buttons for "iniciado"', () => {
    const onTransition = vi.fn();
    const el = BudgetActionsBar({
      onEdit: () => {},
      disabled: false,
      budgetStatus: 'iniciado',
      onTransition
    });

    const labels = findButtonsLabels(el);
    expect(labels).toContain('Editar');
    expect(labels).toContain('Enviar');
    expect(labels).not.toContain('Autorizar');
    expect(labels).not.toContain('Iniciar execução');
    expect(labels).not.toContain('Finalizar');
  });

  it('renders valid transitions for "enviado"', () => {
    const onTransition = vi.fn();
    const el = BudgetActionsBar({
      onEdit: () => {},
      disabled: false,
      budgetStatus: 'enviado',
      onTransition
    });

    const labels = findButtonsLabels(el);
    expect(labels).toContain('Autorizar');
    expect(labels).not.toContain('Enviar');
  });

  it('renders valid transitions for "autorizado"', () => {
    const onTransition = vi.fn();
    const el = BudgetActionsBar({
      onEdit: () => {},
      disabled: false,
      budgetStatus: 'autorizado',
      onTransition
    });

    const labels = findButtonsLabels(el);
    expect(labels).toContain('Iniciar execução');
    expect(labels).not.toContain('Autorizar');
  });

  it('calls onTransition with correct status when clicking transition buttons', () => {
    const onTransition = vi.fn();
    const el = BudgetActionsBar({
      onEdit: () => {},
      disabled: false,
      budgetStatus: 'em_execucao',
      onTransition
    });

    const labels = findButtonsLabels(el);
    expect(labels).toContain('Finalizar');

    // Simulate click
    findButtonAndClick(el, 'Finalizar');
    
    expect(onTransition).toHaveBeenCalledWith('finalizado');
  });

  describe('Lock Indicators', () => {
    it('shows no lock warning for "iniciado"', () => {
      const el = BudgetActionsBar({ onEdit: () => {}, disabled: false, budgetStatus: 'iniciado', onTransition: vi.fn() });
      expect(findLockIndicatorText(el)).toBeNull();
    });

    it('shows lock reason for "enviado"', () => {
      const el = BudgetActionsBar({ onEdit: () => {}, disabled: false, budgetStatus: 'enviado', onTransition: vi.fn() });
      const text = findLockIndicatorText(el);
      expect(text).toContain('Valores bloqueados');
    });

    it('shows lock reason for "autorizado"', () => {
      const el = BudgetActionsBar({ onEdit: () => {}, disabled: false, budgetStatus: 'autorizado', onTransition: vi.fn() });
      const text = findLockIndicatorText(el);
      expect(text).toContain('Valores bloqueados');
    });

    it('shows lock reason for "em_execucao"', () => {
      const el = BudgetActionsBar({ onEdit: () => {}, disabled: false, budgetStatus: 'em_execucao', onTransition: vi.fn() });
      const text = findLockIndicatorText(el);
      expect(text).toContain('Valores bloqueados');
    });

    it('shows operational block reason for "finalizado"', () => {
      const el = BudgetActionsBar({ onEdit: () => {}, disabled: false, budgetStatus: 'finalizado', onTransition: vi.fn() });
      const text = findLockIndicatorText(el);
      expect(text).toContain('Orçamento finalizado');
      expect(text).toContain('Edição bloqueada');
    });
  });
});
