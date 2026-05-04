import { useMemo, useState } from 'react';
import type { CalculationCapture } from '../../../core/types/workflow';
import { calculateCaptureReferenceTotal, isClientPurchaseMaterial, normalizeDecimalValue } from '../utils/captureWorkflow';
import './ClientPurchaseListWorkspace.css';

interface ClientPurchaseListWorkspaceProps {
  captures: CalculationCapture[];
  onUpdate: (id: string, patch: Partial<CalculationCapture>) => void;
}

const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const CLIENT_PURCHASE_VISIBLE_LIMIT = 5;

function money(value: number): string {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

function itemName(capture: CalculationCapture): string {
  return capture.editableDescription?.trim() || capture.summary;
}

function itemQuantity(capture: CalculationCapture): string {
  return capture.quantity?.trim() || '1';
}

function referenceLink(capture: CalculationCapture): string {
  const sourceLine = capture.details.find((detail) => detail.startsWith('Fonte/catálogo:') || detail.startsWith('Link de referência:'));
  return sourceLine?.split(':').slice(1).join(':').trim() ?? '';
}

function buildClientPurchaseText(items: CalculationCapture[]): string {
  const lines = [
    'Lista de compra do cliente',
    'Preço e disponibilidade podem mudar. Confirme na loja antes da compra.',
    '',
    ...items.flatMap((capture, index) => {
      const quantity = itemQuantity(capture);
      const referenceValue = normalizeDecimalValue(capture.materialReferenceUnitValue ?? capture.unitValue);
      const link = referenceLink(capture);
      return [
        `${index + 1}. ${itemName(capture)}`,
        `Quantidade: ${quantity}`,
        referenceValue > 0 ? `Preço de referência: ${money(referenceValue)} un. · total ${money(calculateCaptureReferenceTotal(capture))}` : null,
        capture.technicalNote?.trim() ? `Observação: ${capture.technicalNote.trim()}` : null,
        link && !link.includes('não informado') ? `Link: ${link}` : null,
        '',
      ].filter((line): line is string => Boolean(line));
    }),
  ];
  return lines.join('\n');
}

export function ClientPurchaseListWorkspace({ captures, onUpdate }: ClientPurchaseListWorkspaceProps) {
  const [query, setQuery] = useState('');
  const purchaseItems = captures.filter(isClientPurchaseMaterial);
  const filteredPurchaseItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];
    return purchaseItems.filter((capture) => [itemName(capture), capture.technicalNote, capture.summary, capture.details.join(' ')].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery));
  }, [purchaseItems, query]);
  const visiblePurchaseItems = filteredPurchaseItems.slice(0, CLIENT_PURCHASE_VISIBLE_LIMIT);
  const hiddenPurchaseCount = Math.max(filteredPurchaseItems.length - visiblePurchaseItems.length, 0);
  const totalReference = purchaseItems.reduce((total, capture) => total + calculateCaptureReferenceTotal(capture), 0);

  async function copyList() {
    if (purchaseItems.length === 0) return;
    await navigator.clipboard.writeText(buildClientPurchaseText(purchaseItems));
  }

  return (
    <section className="client-purchase-workspace">
      <div className="client-purchase-summary">
        <article><span>Itens</span><strong>{purchaseItems.length}</strong><small>materiais para o cliente comprar</small></article>
        <article><span>Total referência</span><strong>{money(totalReference)}</strong><small>não entra no valor cobrado</small></article>
        <article><span>Uso offline</span><strong>Manual</strong><small>funciona com catálogo local e itens digitados</small></article>
      </div>

      <div className="client-purchase-panel">
        <header>
          <div>
            <h2>Lista de compra do cliente</h2>
            <p>Revise nome, quantidade, preço e observação antes de enviar. Nada entra direto sem conferência.</p>
          </div>
          <button className="primary-action inline-action" type="button" disabled={purchaseItems.length === 0} onClick={copyList}>Copiar lista</button>
        </header>

        <div className="client-purchase-warning">Preço e disponibilidade podem mudar. Confirme na loja antes da compra.</div>
        <label className="client-purchase-search"><span>Buscar material</span><input value={query} placeholder="Nome, observação ou referência" onChange={(event) => setQuery(event.target.value)} /></label>

        <div className="client-purchase-list">
          {purchaseItems.length === 0 ? (
            <div className="client-purchase-empty">Nenhum material marcado como “Cliente compra” ainda. Use o catálogo ou orçamento para adicionar materiais à lista.</div>
          ) : !query.trim() ? (
            <div className="client-purchase-empty">{purchaseItems.length} material(is) na lista. Pesquise para exibir e editar.</div>
          ) : filteredPurchaseItems.length === 0 ? (
            <div className="client-purchase-empty">Nenhum material encontrado com essa busca.</div>
          ) : visiblePurchaseItems.map((capture) => {
            const link = referenceLink(capture);
            return (
              <article className="client-purchase-card" key={capture.id}>
                {capture.imageDataUrl && <img src={capture.imageDataUrl} alt={`Referência de ${itemName(capture)}`} />}
                <div className="client-purchase-main">
                  <strong>{itemName(capture)}</strong>
                  <small>Quantidade: {itemQuantity(capture)}</small>
                  <small>Total referência: {money(calculateCaptureReferenceTotal(capture))}</small>
                  {link && !link.includes('não informado') && <a href={link} target="_blank" rel="noreferrer">Abrir referência</a>}
                </div>
                <div className="client-purchase-edit">
                  <label>
                    <span>Nome que aparecerá para o cliente</span>
                    <input value={capture.editableDescription ?? capture.summary} onChange={(event) => onUpdate(capture.id, { editableDescription: event.target.value })} />
                  </label>
                  <label>
                    <span>Quantidade</span>
                    <input inputMode="decimal" value={capture.quantity ?? '1'} onChange={(event) => onUpdate(capture.id, { quantity: event.target.value })} />
                  </label>
                  <label>
                    <span>Preço referência unitário</span>
                    <input inputMode="decimal" value={capture.materialReferenceUnitValue ?? capture.unitValue ?? ''} onChange={(event) => onUpdate(capture.id, { materialReferenceUnitValue: event.target.value })} />
                  </label>
                  <label className="wide">
                    <span>Observação ao cliente / equivalente</span>
                    <textarea value={capture.technicalNote ?? ''} placeholder="Ex.: não substituir por 10A; aceita equivalente se for mesma linha e módulo 20A." onChange={(event) => onUpdate(capture.id, { technicalNote: event.target.value })} />
                  </label>
                </div>
              </article>
            );
          })}
          {hiddenPurchaseCount > 0 && <div className="client-purchase-empty compact">Mais {hiddenPurchaseCount} material(is) oculto(s). Use a busca para refinar.</div>}
        </div>
      </div>
    </section>
  );
}
