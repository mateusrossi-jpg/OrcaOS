import type { Budget, BudgetItem } from '../types/business';

export type BudgetValidationSeverity = 'error' | 'warning';

export interface BudgetValidationIssue {
  code: string;
  message: string;
  severity: BudgetValidationSeverity;
}

export function validateBudgetItem(item: BudgetItem, index = 0): BudgetValidationIssue[] {
  const label = `Item ${index + 1}`;
  const issues: BudgetValidationIssue[] = [];

  if (!item.description.trim()) {
    issues.push({ code: 'item-description-required', message: `${label}: informe a descrição.`, severity: 'error' });
  }

  if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
    issues.push({ code: 'item-quantity-invalid', message: `${label}: a quantidade deve ser maior que zero.`, severity: 'error' });
  }

  if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
    issues.push({ code: 'item-price-negative', message: `${label}: o valor unitário não pode ser negativo.`, severity: 'error' });
  }

  if (item.unitPrice === 0) {
    issues.push({ code: 'item-price-zero', message: `${label}: valor zero precisa ser tratado como cortesia/sem cobrança.`, severity: 'warning' });
  }

  return issues;
}

export function validateBudgetForProposal(budget: Budget): BudgetValidationIssue[] {
  const issues: BudgetValidationIssue[] = [];

  if (budget.items.length === 0) {
    issues.push({ code: 'budget-empty', message: 'Adicione itens para gerar uma proposta.', severity: 'error' });
  }

  budget.items.forEach((item, index) => {
    const itemIssues = validateBudgetItem(item, index).map((issue) => {
      if (issue.code !== 'item-price-zero') return issue;
      return {
        ...issue,
        message: `${issue.message} Defina um valor maior que zero antes de gerar a proposta.`,
        severity: 'error' as BudgetValidationSeverity,
      };
    });
    issues.push(...itemIssues);
  });

  if ((budget.discount ?? 0) < 0) {
    issues.push({ code: 'discount-negative', message: 'O desconto não pode ser negativo.', severity: 'error' });
  }

  if ((budget.travelCost ?? 0) < 0) {
    issues.push({ code: 'travel-negative', message: 'O deslocamento não pode ser negativo.', severity: 'error' });
  }

  if ((budget.additionalFees ?? 0) < 0) {
    issues.push({ code: 'fees-negative', message: 'As taxas adicionais não podem ser negativas.', severity: 'error' });
  }

  const canCalculateSubtotal = !issues.some((issue) =>
    ['item-quantity-invalid', 'item-price-negative', 'travel-negative', 'fees-negative', 'discount-negative'].includes(issue.code),
  );
  if (canCalculateSubtotal) {
    const subtotal = budget.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0) + (budget.travelCost ?? 0) + (budget.additionalFees ?? 0);
    if ((budget.discount ?? 0) > subtotal) {
      issues.push({ code: 'discount-too-high', message: 'O desconto não pode ser maior que o subtotal.', severity: 'error' });
    }
  }

  if (!budget.clientId && !budget.notes?.includes('client-confirmed')) {
    issues.push({ code: 'client-missing', message: 'Este orçamento não possui cliente informado.', severity: 'warning' });
  }

  if (budget.status === 'expired') {
    issues.push({ code: 'status-expired', message: 'Este orçamento está marcado como vencido.', severity: 'warning' });
  }

  if (budget.status === 'cancelled') {
    issues.push({ code: 'status-cancelled', message: 'Este orçamento está cancelado.', severity: 'warning' });
  }

  return issues;
}

export function hasBlockingBudgetIssues(issues: BudgetValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}
