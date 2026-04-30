import { useState } from 'react';
import type { CalculationCapture, MaterialSupplyMode } from '../../../core/types/workflow';
import { GuidedBudgetCartRoomAutoBridge } from './GuidedBudgetCartRoomAutoBridge';
import './MaterialSupplyModeBridge.css';

type GuidedCartMode = 'catalog' | 'manual' | 'parts' | 'all';

interface MaterialSupplyModeBridgeProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
  mode?: GuidedCartMode;
}

interface SupplyOption {
  id: MaterialSupplyMode;
  label: string;
  description: string;
  customerText: string;
}

const supplyOptions: SupplyOption[] = [
  {
    id: 'professional',
    label: 'Profissional fornece',
    description: 'Materiais entram no preço do orçamento e podem incluir custo, margem e compra pelo profissional.',
    customerText: 'Materiais fornecidos pelo profissional e incluídos no orçamento.',
  },
  {
    id: 'client',
    label: 'Cliente compra',
    description: 'Materiais viram lista de compra/orientação e não entram no total cobrado pelo profissional.',
    customerText: 'Materiais a serem adquiridos pelo cliente conforme lista orientativa.',
  },
  {
    id: 'mixed',
    label: 'Misto / alinhar',
    description: 'Alguns materiais podem ser fornecidos pelo profissional e outros pelo cliente. Deixe marcado para revisar antes de fechar.',
    customerText: 'Fornecimento de materiais a alinhar entre cliente e profissional antes da aprovação.',
  },
  {
    id: 'undefined',
    label: 'A definir depois',
    description: 'Use quando o levantamento ainda não decidiu quem compra os materiais.',
    customerText: 'Fornecimento de materiais pendente de definição.',
  },
];

function supplyModeLabel(mode: MaterialSupplyMode): string {
  return supplyOptions.find((option) => option.id === mode)?.label ?? 'A definir';
}

function shouldChargeMaterial(mode: MaterialSupplyMode): boolean {
  return mode === 'professional';
}

function applySupplyModeToCapture(capture: CalculationCapture, mode: MaterialSupplyMode): CalculationCapture {
  if (capture.itemType !== 'material') return capture;

  const supplyLabel = supplyModeLabel(mode);
  const referenceUnitValue = capture.materialReferenceUnitValue ?? capture.unitValue ?? '0';
  const chargeMaterial = shouldChargeMaterial(mode);
  const unitValue = chargeMaterial ? capture.unitValue : '0';

  return {
    ...capture,
    unitValue,
    materialSupplyMode: mode,
    materialSupplyLabel: supplyLabel,
    materialReferenceUnitValue: referenceUnitValue,
    clientPurchaseRequired: mode === 'client' || mode === 'mixed' || mode === 'undefined',
    shouldGenerateBudgetItem: chargeMaterial ? capture.shouldGenerateBudgetItem : false,
    summary: chargeMaterial ? capture.summary : `${capture.summary} · ${supplyLabel}`,
    details: [
      ...capture.details,
      `Fornecimento de material: ${supplyLabel}`,
      chargeMaterial
        ? 'Impacto no orçamento: material incluído no valor cobrado pelo profissional.'
        : `Impacto no orçamento: material não entra no total cobrado; valor de referência unitário: ${referenceUnitValue || '0'}.`,
      mode === 'client'
        ? 'Orientação ao cliente: comprar material conforme especificação antes da execução ou alinhar com o profissional.'
        : '',
      mode === 'mixed'
        ? 'Orientação: separar quais itens serão fornecidos pelo profissional e quais serão comprados pelo cliente antes de aprovar a proposta.'
        : '',
      mode === 'undefined'
        ? 'Orientação: definir responsabilidade de compra dos materiais antes do fechamento comercial.'
        : '',
    ].filter(Boolean),
    technicalNote: [
      capture.technicalNote,
      `Fornecimento de material: ${supplyLabel}.`,
      chargeMaterial ? 'Material incluído na proposta.' : 'Material tratado como lista de compra/orientação para o cliente.',
    ].filter(Boolean).join(' '),
  };
}

export function MaterialSupplyModeBridge({ onSendToBudget, mode = 'all' }: MaterialSupplyModeBridgeProps) {
  const [supplyMode, setSupplyMode] = useState<MaterialSupplyMode>('professional');
  const activeOption = supplyOptions.find((option) => option.id === supplyMode) ?? supplyOptions[0];

  function handleSend(items: CalculationCapture[]) {
    onSendToBudget(items.map((item) => applySupplyModeToCapture(item, supplyMode)));
  }

  return (
    <section className="material-supply-bridge">
      <div className="material-supply-header">
        <div>
          <span className="orca-kicker">Materiais do orçamento</span>
          <h2>Quem vai comprar os materiais?</h2>
          <p>Defina como os materiais lançados no orçamento guiado serão tratados na proposta.</p>
        </div>
        <strong>{activeOption.label}</strong>
      </div>

      <div className="material-supply-options">
        {supplyOptions.map((option) => (
          <button className={option.id === supplyMode ? 'material-supply-option active' : 'material-supply-option'} type="button" key={option.id} onClick={() => setSupplyMode(option.id)}>
            <strong>{option.label}</strong>
            <small>{option.description}</small>
          </button>
        ))}
      </div>

      <div className="material-supply-note">
        <strong>Texto para proposta/cliente</strong>
        <small>{activeOption.customerText}</small>
      </div>

      <GuidedBudgetCartRoomAutoBridge onSendToBudget={handleSend} mode={mode} />
    </section>
  );
}
