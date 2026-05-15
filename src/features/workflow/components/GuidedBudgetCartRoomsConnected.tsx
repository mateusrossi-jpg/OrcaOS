import { useEffect, useMemo, useState } from 'react';
import { handleNumericInputFocus } from '../../../core/ui/numericInputFocus';
import { catalogPartBrands, catalogPartCategories, searchCatalogParts, type CatalogPart } from '../../../data/parts/catalogParts';
import {
  createGuidedLaborTemplate,
  loadGuidedLaborTemplates,
  saveGuidedLaborTemplates,
  starterGuidedLaborTemplates,
  type GuidedLaborTemplate,
} from '../storage/guidedLaborTemplatesStorage';
import { loadGuidedRooms } from '../storage/guidedRoomsStorage';
import './GuidedBudgetCart.css';
import './GuidedBudgetCartGrouped.css';
import { kitBrands, kitTemplates } from '../data/kitTemplates';
import { formatCurrency, createId, parseDecimal, guidedLineKey, mergeLineInto, partNote, makeCapture, lineTotal, kindLabel } from '../utils/guidedBudgetUtils';
import type { CalculationDestination, TechnicalItemType } from '../../../core/types/workflow';
import type { GuidedCartMode, GuidedLine, KitId, GuidedBudgetCartProps } from '../types/guidedBudget';
import { GuidedBudgetCartHeader } from './guidedBudget/GuidedBudgetCartHeader';

const emptyManualPart = {
  title: '',
  brand: '',
  model: '',
  quantity: '1',
  unitValue: '',
  destination: 'both' as CalculationDestination,
  note: '',
};

export function GuidedBudgetCart({ onSendToBudget, mode = 'all' }: GuidedBudgetCartProps) {
  const [savedRoomsRefreshKey, setSavedRoomsRefreshKey] = useState(0);
  const savedRoomNames = useMemo(() => loadGuidedRooms().map((room) => room.name), [savedRoomsRefreshKey]);
  const [environment, setEnvironment] = useState(savedRoomNames[0] ?? 'Sala');
  const [customEnvironment, setCustomEnvironment] = useState('');
  const [lines, setLines] = useState<GuidedLine[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [laborTemplates, setLaborTemplates] = useState<GuidedLaborTemplate[]>(() => loadGuidedLaborTemplates());
  const [showLaborManager, setShowLaborManager] = useState(false);
  const [laborManagerQuery, setLaborManagerQuery] = useState('');
  const [newLaborTemplate, setNewLaborTemplate] = useState({ title: '', defaultUnitValue: '', unit: 'ponto', note: '' });
  const [laborQuantityById, setLaborQuantityById] = useState<Record<string, string>>({});
  const [laborValueById, setLaborValueById] = useState<Record<string, string>>({});
  const [manualPart, setManualPart] = useState(emptyManualPart);
  const [partQuery, setPartQuery] = useState('');
  const [partBrand, setPartBrand] = useState('');
  const [partCategory, setPartCategory] = useState('');
  const [selectedKitId, setSelectedKitId] = useState<KitId>('double-outlet-4x2');
  const [kitQuantity, setKitQuantity] = useState('4');
  const [kitBrand, setKitBrand] = useState('Fabricante B');
  const [kitDestination, setKitDestination] = useState<CalculationDestination>('both');

  const showManual = mode === 'manual' || mode === 'all';
  const showCatalog = mode === 'catalog' || mode === 'all';
  const showParts = mode === 'parts' || mode === 'all';
  const activeEnvironment = customEnvironment.trim() || environment || savedRoomNames[0] || 'Sem ambiente';
  const selectedKit = kitTemplates.find((kit) => kit.id === selectedKitId) ?? kitTemplates[0];
  const visibleLaborTemplates = laborTemplates.filter((template) => template.visible);
  
  const filteredLaborTemplates = useMemo(() => {
    const query = laborManagerQuery.trim().toLowerCase();
    if (!query) return laborTemplates;
    return laborTemplates.filter((template) => 
      [template.title, template.unit, template.note].join(' ').toLowerCase().includes(query)
    );
  }, [laborTemplates, laborManagerQuery]);

  const hasLaborLookup = laborManagerQuery.trim().length > 0;
  const hasPartLookup = partQuery.trim().length > 0 || partBrand !== '' || partCategory !== '';
  const partResults = useMemo(() => (hasPartLookup ? searchCatalogParts(partQuery, partBrand, partCategory) : []), [hasPartLookup, partBrand, partCategory, partQuery]);

  const environmentGroups = useMemo(() => {
    const groups: Record<string, {
      name: string;
      lines: GuidedLine[];
      itemCount: number;
      totalQuantity: number;
      subtotal: number;
      materialSubtotal: number;
      serviceSubtotal: number;
    }> = {};

    lines.forEach((line) => {
      const env = line.environment || 'Sem ambiente';
      if (!groups[env]) {
        groups[env] = {
          name: env,
          lines: [],
          itemCount: 0,
          totalQuantity: 0,
          subtotal: 0,
          materialSubtotal: 0,
          serviceSubtotal: 0,
        };
      }
      groups[env].lines.push(line);
      groups[env].itemCount += 1;
      groups[env].totalQuantity += line.quantity;
      const total = lineTotal(line);
      groups[env].subtotal += total;
      if (line.itemType === 'material') {
        groups[env].materialSubtotal += total;
      } else {
        groups[env].serviceSubtotal += total;
      }
    });

    return Object.values(groups);
  }, [lines]);

  const totalValue = environmentGroups.reduce((sum, group) => sum + group.subtotal, 0);
  const totalQuantity = environmentGroups.reduce((sum, group) => sum + group.totalQuantity, 0);

  useEffect(() => {
    saveGuidedLaborTemplates(laborTemplates);
  }, [laborTemplates]);

  function quantityInCurrentEnvironment(description: string, itemType?: TechnicalItemType): number {
    return lines
      .filter((line) => line.environment === activeEnvironment && line.description === description && (!itemType || line.itemType === itemType))
      .reduce((sum, line) => sum + line.quantity, 0);
  }

  function addLine(line: Omit<GuidedLine, 'id' | 'environment'> & { environment?: string }) {
    setFeedback(null);
    const incoming = { ...line, id: createId('guided-line'), environment: line.environment || activeEnvironment };
    setLines((current) => mergeLineInto(current, incoming));
  }

  function addLines(nextLines: Array<Omit<GuidedLine, 'id' | 'environment'>>) {
    setFeedback(null);
    setLines((current) => nextLines.reduce((merged, line) => mergeLineInto(merged, { ...line, id: createId('guided-kit-line'), environment: activeEnvironment }), current));
  }

  function updateLaborTemplate(id: string, patch: Partial<Pick<GuidedLaborTemplate, 'title' | 'defaultUnitValue' | 'unit' | 'note' | 'visible'>>) {
    setLaborTemplates((current) => current.map((template) => (
      template.id === id ? { ...template, ...patch, updatedAt: new Date().toISOString() } : template
    )));
  }

  function setAllLaborVisibility(visible: boolean) {
    const updatedAt = new Date().toISOString();
    setLaborTemplates((current) => current.map((template) => ({ ...template, visible, updatedAt })));
    setFeedback(visible ? 'Todos os serviços foram liberados para seleção.' : 'Todos os serviços foram ocultados da seleção.');
  }

  function addLaborTemplate() {
    const title = newLaborTemplate.title.trim();
    const defaultUnitValue = parseDecimal(newLaborTemplate.defaultUnitValue, 0);
    const unit = newLaborTemplate.unit.trim() || 'un.';
    if (!title) {
      setFeedback('Informe o nome do serviço para cadastrar na mão de obra.');
      return;
    }

    const template = createGuidedLaborTemplate({
      title,
      defaultUnitValue,
      unit,
      note: newLaborTemplate.note.trim() || 'Serviço personalizado criado na mão de obra.',
      visible: true,
    });

    setLaborTemplates((current) => [template, ...current]);
    setLaborValueById((current) => ({ ...current, [template.id]: String(template.defaultUnitValue) }));
    setNewLaborTemplate({ title: '', defaultUnitValue: '', unit: 'ponto', note: '' });
    setFeedback('Serviço cadastrado e liberado para seleção.');
  }

  function restoreStarterLaborTemplates() {
    setLaborTemplates(starterGuidedLaborTemplates);
    setFeedback('Lista padrão de mão de obra restaurada.');
  }

  function addLabor(template: GuidedLaborTemplate) {
    const quantity = parseDecimal(laborQuantityById[template.id] ?? '1', 1);
    const unitValue = parseDecimal(laborValueById[template.id] ?? String(template.defaultUnitValue), template.defaultUnitValue);
    if (quantity <= 0) return;
    addLine({ kind: 'labor', description: template.title, quantity, unitValue, itemType: 'service', destination: 'budget', note: `${template.note} Unidade: ${template.unit}.` });
  }

  function addManualPart() {
    const description = manualPart.title.trim();
    const quantity = parseDecimal(manualPart.quantity, 1);
    const unitValue = parseDecimal(manualPart.unitValue, 0);
    if (!description || quantity <= 0) return;
    addLine({ kind: 'manual-part', description, quantity, unitValue, itemType: 'material', destination: manualPart.destination, note: manualPart.note.trim() || 'Peça/material criado manualmente no orçamento.', brand: manualPart.brand.trim(), model: manualPart.model.trim() });
    setManualPart(emptyManualPart);
  }

  function addSelectedKit() {
    const quantity = parseDecimal(kitQuantity, parseDecimal(selectedKit.defaultQuantity, 1));
    if (quantity <= 0) return;
    const brand = kitBrand === 'Outra' ? '' : kitBrand;
    addLines(selectedKit.generate(quantity, brand, kitDestination));
  }

  function addCatalogPart(part: CatalogPart) {
    addLine({ kind: 'catalog-part', description: part.title, quantity: 1, unitValue: part.estimatedPrice ?? 0, itemType: 'material', destination: 'both', note: partNote(part), brand: part.brand, model: part.model });
  }

  function updateLineQuantity(id: string, value: string) {
    const quantity = parseDecimal(value, 0);
    setLines((current) => current.map((line) => (line.id === id ? { ...line, quantity } : line)).filter((line) => line.quantity > 0));
  }

  function updateLineUnitValue(id: string, value: string) {
    const unitValue = parseDecimal(value, 0);
    setLines((current) => current.map((line) => (line.id === id ? { ...line, unitValue } : line)));
  }

  function duplicateLine(line: GuidedLine) {
    setLines((current) => mergeLineInto(current, { ...line, id: createId('copy-guided-line') }));
  }

  function removeLine(id: string) {
    setLines((current) => current.filter((line) => line.id !== id));
  }

  function sendAll() {
    if (lines.length === 0) return;
    onSendToBudget(lines.map(makeCapture));
    setFeedback(`${lines.length} tipo(s), ${totalQuantity} unidade(s), enviados para o fluxo escolhido.`);
    setLines([]);
  }

  return (
    <section className="guided-cart-panel">
      <GuidedBudgetCartHeader lines={lines} />
      <div className="guided-manual-block-card">
        <div>
          <strong>Ambiente atual</strong>
          <small>Os próximos serviços e peças serão lançados neste ambiente.</small>
        </div>
        <div className="guided-manual-grid">
          <label className="technical-edit-field">
            <span>Ambiente cadastrado</span>
            <select value={environment} onChange={(event) => setEnvironment(event.target.value)}>
              {savedRoomNames.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label className="technical-edit-field guided-wide-field">
            <span>Ou digite outro ambiente</span>
            <input value={customEnvironment} placeholder="Ex.: Corredor superior, suíte, área gourmet..." onChange={(event) => setCustomEnvironment(event.target.value)} />
          </label>
        </div>
        <button className="secondary-action inline-action" type="button" onClick={() => setSavedRoomsRefreshKey((current) => current + 1)}>Atualizar cômodos</button>
      </div>

      {showCatalog && (
        <div className="guided-manual-block-card">
          <div className="guided-labor-toolbar">
            <div>
              <strong>Mão de obra</strong>
              <small>Cadastre serviços, defina valores base e deixe visível só o que vai usar no campo.</small>
            </div>
            <div className="guided-labor-actions">
              <span>{visibleLaborTemplates.length} de {laborTemplates.length} visíveis</span>
              <button className="secondary-action inline-action" type="button" onClick={() => setShowLaborManager((current) => !current)}>
                {showLaborManager ? 'Fechar ajustes' : 'Gerenciar serviços'}
              </button>
            </div>
          </div>
          <label className="technical-edit-field guided-wide-field">
            <span>Buscar serviço para adicionar</span>
            <input value={laborManagerQuery} placeholder="Digite tomada, luminária, quadro..." onChange={(event) => setLaborManagerQuery(event.target.value)} />
          </label>

          {showLaborManager && (
            <div className="guided-labor-manager">
              <div className="guided-labor-new">
                <div>
                  <strong>Novo tipo de trabalho</strong>
                  <small>O valor padrão entra no card, mas pode ser ajustado antes de adicionar ao orçamento.</small>
                </div>
                <div className="guided-manual-grid">
                  <label className="technical-edit-field guided-wide-field">
                    <span>Serviço</span>
                    <input value={newLaborTemplate.title} placeholder="Ex.: Instalação de ventilador de teto" onChange={(event) => setNewLaborTemplate((current) => ({ ...current, title: event.target.value }))} />
                  </label>
                  <label className="technical-edit-field">
                    <span>Unidade</span>
                    <input value={newLaborTemplate.unit} placeholder="ponto, un., m, serviço..." onChange={(event) => setNewLaborTemplate((current) => ({ ...current, unit: event.target.value }))} />
                  </label>
                  <label className="technical-edit-field">
                    <span>Valor padrão</span>
                    <input inputMode="decimal" onFocus={handleNumericInputFocus} value={newLaborTemplate.defaultUnitValue} placeholder="0,00" onChange={(event) => setNewLaborTemplate((current) => ({ ...current, defaultUnitValue: event.target.value }))} />
                  </label>
                  <label className="technical-edit-field guided-wide-field">
                    <span>Observação</span>
                    <textarea value={newLaborTemplate.note} placeholder="Ex.: validar altura, fixação, acesso e acabamento." onChange={(event) => setNewLaborTemplate((current) => ({ ...current, note: event.target.value }))} />
                  </label>
                </div>
                <button className="primary-action inline-action" type="button" onClick={addLaborTemplate}>Cadastrar serviço</button>
              </div>

              <div className="guided-labor-editor-list">
                <div className="guided-labor-manager-controls">
                  <label className="technical-edit-field guided-wide-field">
                    <span>Buscar serviço cadastrado</span>
                    <input value={laborManagerQuery} placeholder="Ex.: tomada, quadro, luminária..." onChange={(event) => setLaborManagerQuery(event.target.value)} />
                  </label>
                  <div className="guided-labor-visibility-actions">
                    <button className="secondary-action inline-action" type="button" onClick={() => setAllLaborVisibility(true)}>Mostrar todos</button>
                    <button className="secondary-action inline-action" type="button" onClick={() => setAllLaborVisibility(false)}>Ocultar todos</button>
                  </div>
                  <small>Marque como visível apenas os serviços que devem aparecer nos cards de seleção do campo.</small>
                </div>

                {!hasLaborLookup ? (
                  <div className="guided-labor-empty">
                    <strong>Pesquise para listar serviços cadastrados</strong>
                    <small>Os serviços ficam ocultos até você buscar por nome, unidade ou observação.</small>
                  </div>
                ) : filteredLaborTemplates.length === 0 && (
                  <div className="guided-labor-empty">
                    <strong>Nenhum serviço encontrado</strong>
                    <small>Limpe a busca ou cadastre um novo tipo de trabalho.</small>
                  </div>
                )}

                {filteredLaborTemplates.map((template) => (
                  <article className="guided-labor-editor-row" key={template.id}>
                    <label className="guided-labor-visibility">
                      <input checked={template.visible} type="checkbox" onChange={(event) => updateLaborTemplate(template.id, { visible: event.target.checked })} />
                      <span>{template.visible ? 'Visível' : 'Oculto'}</span>
                    </label>
                    <label className="technical-edit-field guided-wide-field">
                      <span>Serviço</span>
                      <input value={template.title} onChange={(event) => updateLaborTemplate(template.id, { title: event.target.value })} />
                    </label>
                    <label className="technical-edit-field">
                      <span>Unidade</span>
                      <input value={template.unit} onChange={(event) => updateLaborTemplate(template.id, { unit: event.target.value })} />
                    </label>
                    <label className="technical-edit-field">
                      <span>Valor</span>
                      <input inputMode="decimal" onFocus={handleNumericInputFocus} value={String(template.defaultUnitValue)} onChange={(event) => updateLaborTemplate(template.id, { defaultUnitValue: parseDecimal(event.target.value, 0) })} />
                    </label>
                    <label className="technical-edit-field guided-wide-field">
                      <span>Observação</span>
                      <textarea value={template.note} onChange={(event) => updateLaborTemplate(template.id, { note: event.target.value })} />
                    </label>
                  </article>
                ))}
              </div>

              <button className="secondary-action inline-action" type="button" onClick={restoreStarterLaborTemplates}>Restaurar lista padrão</button>
            </div>
          )}

          {!hasLaborLookup ? (
            <div className="guided-labor-empty">
              <strong>Busque um serviço para adicionar</strong>
              <small>Nenhum serviço aparece por padrão para manter a tela limpa no campo.</small>
            </div>
          ) : filteredLaborTemplates.filter((template) => template.visible).length === 0 ? (
            <div className="guided-labor-empty">
              <strong>Nenhum serviço visível encontrado</strong>
              <small>Ajuste a busca ou abra o gerenciador para liberar serviços.</small>
            </div>
          ) : (
            <div className="guided-service-grid">
              {filteredLaborTemplates.filter((template) => template.visible).map((template) => {
              const addedQuantity = quantityInCurrentEnvironment(template.title, 'service');
              return (
                <article className="guided-service-card" key={template.id}>
                  <div>
                    <strong>{template.title}</strong>
                    <small>{formatCurrency(template.defaultUnitValue)} / {template.unit}</small>
                    <small>{template.note}</small>
                    {addedQuantity > 0 && <span className="guided-cart-count">{addedQuantity} lançado(s) neste ambiente</span>}
                  </div>
                  <div className="guided-service-controls">
                    <label className="guided-typed-quantity"><span>Qtd.</span><input inputMode="decimal" onFocus={handleNumericInputFocus} value={laborQuantityById[template.id] ?? '1'} onChange={(event) => setLaborQuantityById((current) => ({ ...current, [template.id]: event.target.value }))} /></label>
                    <label className="guided-typed-quantity"><span>Valor</span><input inputMode="decimal" onFocus={handleNumericInputFocus} value={laborValueById[template.id] ?? String(template.defaultUnitValue)} onChange={(event) => setLaborValueById((current) => ({ ...current, [template.id]: event.target.value }))} /></label>
                    <button className="primary-action inline-action" type="button" onClick={() => addLabor(template)}>Adicionar</button>
                  </div>
                </article>
              );
              })}
            </div>
          )}
        </div>
      )}

      {showParts && (
        <>
          <div className="guided-manual-block-card">
            <div><strong>Kits automáticos</strong><small>Escolha o kit, informe a quantidade e gere materiais + serviços sugeridos no ambiente atual.</small></div>
            <div className="guided-manual-grid">
              <label className="technical-edit-field guided-wide-field"><span>Kit</span><select value={selectedKitId} onChange={(event) => { const id = event.target.value as KitId; setSelectedKitId(id); setKitQuantity(kitTemplates.find((kit) => kit.id === id)?.defaultQuantity ?? '1'); }}>{kitTemplates.map((kit) => <option key={kit.id} value={kit.id}>{kit.title}</option>)}</select></label>
              <label className="technical-edit-field"><span>Quantidade</span><input inputMode="decimal" onFocus={handleNumericInputFocus} value={kitQuantity} onChange={(event) => setKitQuantity(event.target.value)} /></label>
              <label className="technical-edit-field"><span>Marca desejada</span><select value={kitBrand} onChange={(event) => setKitBrand(event.target.value)}>{kitBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
              <label className="technical-edit-field"><span>Destino</span><select value={kitDestination} onChange={(event) => setKitDestination(event.target.value as CalculationDestination)}><option value="survey">Atendimento</option><option value="budget">Orçamento</option><option value="both">Ambos</option></select></label>
            </div>
            <div className="guided-cart-summary"><strong>{selectedKit.title}</strong><small>{selectedKit.description}</small></div>
            <button className="primary-action inline-action" type="button" onClick={addSelectedKit}>Gerar kit selecionado</button>
          </div>

          <div className="guided-manual-block-card">
            <div><strong>Peça/material manual</strong><small>Digite qualquer material, marca, modelo, quantidade e valor.</small></div>
            <div className="guided-manual-grid"><label className="technical-edit-field guided-wide-field"><span>Descrição da peça</span><input value={manualPart.title} placeholder="Ex.: chassis 4x2, tomada 20A, placa dupla..." onChange={(event) => setManualPart((current) => ({ ...current, title: event.target.value }))} /></label><label className="technical-edit-field"><span>Marca</span><input value={manualPart.brand} placeholder="Ex.: Fabricante B" onChange={(event) => setManualPart((current) => ({ ...current, brand: event.target.value }))} /></label><label className="technical-edit-field"><span>Modelo/ref.</span><input value={manualPart.model} placeholder="Opcional" onChange={(event) => setManualPart((current) => ({ ...current, model: event.target.value }))} /></label><label className="technical-edit-field"><span>Quantidade</span><input inputMode="decimal" onFocus={handleNumericInputFocus} value={manualPart.quantity} onChange={(event) => setManualPart((current) => ({ ...current, quantity: event.target.value }))} /></label><label className="technical-edit-field"><span>Valor unitário</span><input inputMode="decimal" onFocus={handleNumericInputFocus} value={manualPart.unitValue} placeholder="0,00" onChange={(event) => setManualPart((current) => ({ ...current, unitValue: event.target.value }))} /></label><label className="technical-edit-field"><span>Destino</span><select value={manualPart.destination} onChange={(event) => setManualPart((current) => ({ ...current, destination: event.target.value as CalculationDestination }))}><option value="survey">Atendimento</option><option value="budget">Orçamento</option><option value="both">Ambos</option></select></label><label className="technical-edit-field guided-wide-field"><span>Observação</span><textarea value={manualPart.note} placeholder="Ex.: confirmar disponibilidade, usar 20A na cozinha..." onChange={(event) => setManualPart((current) => ({ ...current, note: event.target.value }))} /></label></div>
            <button className="primary-action inline-action" type="button" onClick={addManualPart}>Adicionar peça manual</button>
          </div>

          <div className="parts-catalog-panel"><div className="parts-search-grid"><label className="technical-edit-field parts-search-wide"><span>Buscar na base interna</span><input value={partQuery} placeholder="Ex.: tomada 20A, disjuntor bipolar..." onChange={(event) => setPartQuery(event.target.value)} /></label><label className="technical-edit-field"><span>Marca</span><select value={partBrand} onChange={(event) => setPartBrand(event.target.value)}><option value="">Todas</option>{catalogPartBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label><label className="technical-edit-field"><span>Categoria</span><select value={partCategory} onChange={(event) => setPartCategory(event.target.value)}><option value="">Todas</option>{catalogPartCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label></div><div className="parts-results-header"><strong>{hasPartLookup ? `${partResults.length} peça(s) encontrada(s)` : 'Pesquise para exibir peças'}</strong><small>Resultados aparecem apenas após busca ou filtro.</small></div><div className="parts-result-list">{partResults.map((part) => { const addedQuantity = quantityInCurrentEnvironment(part.title, 'material'); return <article className="part-result-card" key={part.id}><div className="part-result-main"><span>{part.brand}</span><strong>{part.title}</strong><small>{[part.line, part.category, part.subcategory, part.current, part.voltage].filter(Boolean).join(' · ')}</small>{addedQuantity > 0 && <span className="guided-cart-count">{addedQuantity} lançado(s) neste ambiente</span>}</div><div className="part-result-controls"><button className="primary-action inline-action" type="button" onClick={() => addCatalogPart(part)}>Adicionar</button></div></article>; })}</div></div>
        </>
      )}

      {showManual && mode === 'manual' && <div className="guided-manual-block-card"><div><strong>Bloco manual rápido</strong><small>Para observações livres, use a aba Peças com descrição personalizada.</small></div></div>}

      <div className="guided-cart-summary grouped-summary"><strong>Resumo por ambiente</strong>{environmentGroups.length === 0 ? <small>Nenhum item adicionado ainda.</small> : <div className="environment-summary-list">{environmentGroups.map((group) => <article className="environment-summary-card" key={group.name}><header><div><strong>{group.name}</strong><small>{group.itemCount} tipo(s) · {group.totalQuantity} unidade(s)</small></div><b>{formatCurrency(group.subtotal)}</b></header><div className="environment-subtotals"><span>Materiais: {formatCurrency(group.materialSubtotal)}</span><span>Serviços: {formatCurrency(group.serviceSubtotal)}</span></div><div className="environment-line-preview">{group.lines.slice(0, 5).map((line) => <span key={line.id}>{line.quantity}× {line.description}</span>)}{group.lines.length > 5 && <span>+ {group.lines.length - 5} item(ns)</span>}</div></article>)}</div>}</div>

      {environmentGroups.length > 0 && <div className="environment-grouped-editor">{environmentGroups.map((group) => <section className="environment-editor-group" key={group.name}><header><div><span>Ambiente</span><strong>{group.name}</strong></div><b>{formatCurrency(group.subtotal)}</b></header><div className="parts-result-list">{group.lines.map((line) => <article className="part-result-card active" key={line.id}><div className="part-result-main"><span>{kindLabel(line.kind)} · {line.itemType === 'material' ? 'Material' : 'Serviço'}</span><strong>{line.description}</strong><small>{line.brand ? `${line.brand}${line.model ? ` · ${line.model}` : ''}` : line.note}</small></div><div className="part-result-controls"><label className="guided-typed-quantity"><span>Qtd.</span><input inputMode="decimal" onFocus={handleNumericInputFocus} value={String(line.quantity)} onChange={(event) => updateLineQuantity(line.id, event.target.value)} /></label><label className="guided-typed-quantity"><span>Valor</span><input inputMode="decimal" onFocus={handleNumericInputFocus} value={String(line.unitValue)} onChange={(event) => updateLineUnitValue(line.id, event.target.value)} /></label><button className="secondary-action inline-action" type="button" onClick={() => duplicateLine(line)}>Duplicar</button><button className="danger-action" type="button" onClick={() => removeLine(line.id)}>Remover</button></div></article>)}</div></section>)}</div>}

      <div className="guided-cart-actions"><button className="primary-action inline-action" type="button" disabled={lines.length === 0} onClick={sendAll}>Enviar itens ao fluxo</button><button className="secondary-action inline-action" type="button" disabled={lines.length === 0} onClick={() => setLines([])}>Limpar itens</button></div>{feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
