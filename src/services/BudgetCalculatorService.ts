import { Budget, BudgetItem } from '../domain/budget';
import { sanitizeNumericFields } from '../core/runtime/safeGuards';

export interface BudgetCalculationResult {
  subtotal: number;
  totalMateriais: number;
  totalOperacional: number;
  valorDesconto: number;
  valorTaxas: number;
  valorDeslocamento: number;
  totalComercial: number; // Final charged
  lucroBruto: number;
  margemPercentual: number;
  statusLucro: 'saudavel' | 'atencao' | 'prejuizo';
  // Aliases for compatibility
  grossProfit: number;
  marginPercent: number;
  totalCost: number;
}

export class BudgetCalculatorService {
  private static instance: BudgetCalculatorService;

  private constructor() {}

  static getInstance(): BudgetCalculatorService {
    if (!BudgetCalculatorService.instance) {
      BudgetCalculatorService.instance = new BudgetCalculatorService();
    }
    return BudgetCalculatorService.instance;
  }

  public calculateItemTotal(item: BudgetItem): number {
    const qty = Number.isFinite(item.quantity) ? item.quantity : 0;
    const price = Number.isFinite(item.unitPrice) ? item.unitPrice : 0;
    return qty * price;
  }

  public calculateBudget(budget: Budget): BudgetCalculationResult {
    // 1. Calcular Custo de Itens Brutos
    let subtotal = 0;
    const items = Array.isArray(budget.items) ? budget.items : [];
    
    for (const item of items) {
      subtotal += this.calculateItemTotal(item);
    }

    // 2. Extrair Custos Adicionais/Operacionais
    const travelCost = Number(budget.travelCost) || 0;
    const additionalFees = Number(budget.fees) || 0;
    const materialCost = Number(budget.materialCost) || 0;
    const helperCost = Number(budget.helperCost) || 0;
    const otherCosts = Number(budget.otherCosts) || 0;
    
    // Fallback: se não usar inputs legados separados (materialCost), assumir que subtotal inclui material+labor
    const totalMateriais = materialCost;
    const totalOperacional = helperCost + otherCosts + travelCost + additionalFees;
    
    const absoluteCostBase = totalMateriais + totalOperacional; 
    
    const baseComercialBruta = subtotal > 0 ? (subtotal + travelCost + additionalFees) : absoluteCostBase;
    
    const discounts = Number(budget.discounts) || 0;

    // 3. Lucro Real e Margem (Total Final Cobrado - Custos Totais)
    // Se o valor cobrado foi inputado manualmente, usamos ele menos descontos.
    const baseCharged = Number(budget.chargedValue) && budget.chargedValue > 0 
      ? budget.chargedValue 
      : baseComercialBruta;
      
    const finalChargedValue = Math.max(baseCharged - discounts, 0);
    
    // Custo Total Oficial
    const totalCostOficial = materialCost + travelCost + helperCost + otherCosts + additionalFees;
    
    const grossProfit = finalChargedValue - totalCostOficial;
    let marginPercent = 0;
    
    if (finalChargedValue > 0) {
      marginPercent = (grossProfit / finalChargedValue) * 100;
    }

    let statusLucro: 'saudavel' | 'atencao' | 'prejuizo' = 'saudavel';
    if (grossProfit < 0) {
      statusLucro = 'prejuizo';
    } else if (marginPercent < 20) {
      statusLucro = 'atencao';
    }

    const finalResult: BudgetCalculationResult = {
      subtotal,
      totalMateriais,
      totalOperacional,
      valorDesconto: discounts,
      valorTaxas: additionalFees,
      valorDeslocamento: travelCost,
      totalComercial: finalChargedValue,
      lucroBruto: grossProfit,
      margemPercentual: marginPercent,
      statusLucro,
      grossProfit,
      marginPercent,
      totalCost: totalCostOficial,
    };

    // Global NaN / Infinity protection via centralized sanitizer
    return sanitizeNumericFields(finalResult);
  }
}

export const budgetCalculator = BudgetCalculatorService.getInstance();
