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
import { Input, Select, TextArea, Button } from '../../../app/components/ui';

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

  function sendEnvironment(envName: string) {
    const envLines = lines.filter((line) => (line.environment || 'Sem ambiente') === envName);
    if (envLines.length === 0) return;
    onSendToBudget(envLines.map(makeCapture));
    const remainingLines = lines.filter((line) => (line.environment || 'Sem ambiente') !== envName);
    const totalEnvQuantity = envLines.reduce((sum, line) => sum + line.quantity, 0);
    setFeedback(`${envLines.length} tipo(s), ${totalEnvQuantity} unidade(s) do ambiente "${envName}" enviados para o fluxo escolhido.`);
    setLines(remainingLines);
  }

  return (
    <section className="guided-cart-panel">
      <GuidedBudgetCartHeader lines={lines} />
      <div className="guided-manual-block-card aferix-card-surface">
        <div>
          <strong>Ambiente atual</strong>
          <small>Os próximos serviços e peças serão lançados neste ambiente.</small>
        </div>
        <div className="guided-manual-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
          <Select
            className="technical-edit-field"
            label="Ambiente cadastrado"
            value={environment}
            onChange={(val) => setEnvironment(val)}
          >
            {savedRoomNames.map((name) => <option key={name} value={name}>{name}</option>)}
          </Select>
          <Input
            className="technical-edit-field guided-wide-field"
            label="Ou digite outro ambiente"
            value={customEnvironment}
            placeholder="Ex.: Corredor superior, suíte, área gourmet..."
            onChange={(event) => setCustomEnvironment(event.target.value)}
          />
        </div>
        <Button variant="secondary" className="inline-action" style={{ marginTop: '12px' }} onClick={() => setSavedRoomsRefreshKey((current) => current + 1)}>
          Atualizar cômodos
        </Button>
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
              <Button variant="secondary" className="inline-action" onClick={() => setShowLaborManager((current) => !current)}>
                {showLaborManager ? 'Fechar ajustes' : 'Gerenciar serviços'}
              </Button>
            </div>
          </div>
          <Input className="guided-wide-field" label="Buscar serviço para adicionar" value={laborManagerQuery} placeholder="Digite tomada, luminária, quadro..." onChange={(event) => setLaborManagerQuery(event.target.value)} />

          {showLaborManager && (
            <div className="guided-labor-manager">
              <div className="guided-labor-new aferix-card-surface" style={{ marginBottom: '16px' }}>
                <div>
                  <strong>Novo tipo de trabalho</strong>
                  <small>O valor padrão entra no card, mas pode ser ajustado antes de adicionar ao orçamento.</small>
                </div>
                <div className="guided-manual-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                  <Input className="guided-wide-field" style={{ flex: '1 1 100%' }} label="Serviço" value={newLaborTemplate.title} placeholder="Ex.: Instalação de ventilador de teto" onChange={(event) => setNewLaborTemplate((current) => ({ ...current, title: event.target.value }))} />
                  <Input style={{ flex: '1' }} label="Unidade" value={newLaborTemplate.unit} placeholder="ponto, un., m, serviço..." onChange={(event) => setNewLaborTemplate((current) => ({ ...current, unit: event.target.value }))} />
                  <Input style={{ flex: '1' }} label="Valor padrão" inputMode="decimal" onFocus={handleNumericInputFocus} value={newLaborTemplate.defaultUnitValue} placeholder="0,00" onChange={(event) => setNewLaborTemplate((current) => ({ ...current, defaultUnitValue: event.target.value }))} />
                  <div className="guided-wide-field" style={{ flex: '1 1 100%' }}>
                    <TextArea label="Observação" value={newLaborTemplate.note} placeholder="Ex.: validar altura, fixação, acesso e acabamento." onChange={(val) => setNewLaborTemplate((current) => ({ ...current, note: val }))} />
                  </div>
                </div>
                <Button variant="primary" className="inline-action" style={{ marginTop: '12px' }} onClick={addLaborTemplate}>Cadastrar serviço</Button>
              </div>

              <div className="guided-labor-editor-list">
                <div className="guided-labor-manager-controls">
                  <Input className="guided-wide-field" label="Buscar serviço cadastrado" value={laborManagerQuery} placeholder="Ex.: tomada, quadro, luminária..." onChange={(event) => setLaborManagerQuery(event.target.value)} />
                  <div className="guided-labor-visibility-actions" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <Button variant="secondary" className="inline-action" onClick={() => setAllLaborVisibility(true)}>Mostrar todos</Button>
                    <Button variant="secondary" className="inline-action" onClick={() => setAllLaborVisibility(false)}>Ocultar todos</Button>
                  </div>
                  <small style={{ display: 'block', marginTop: '8px', color: 'var(--aferix-text-secondary)' }}>Marque como visível apenas os serviços que devem aparecer nos cards de seleção do campo.</small>
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
                    <Input className="guided-wide-field" label="Serviço" value={template.title} onChange={(event) => updateLaborTemplate(template.id, { title: event.target.value })} />
                    <Input label="Unidade" value={template.unit} onChange={(event) => updateLaborTemplate(template.id, { unit: event.target.value })} />
                    <Input label="Valor" inputMode="decimal" onFocus={handleNumericInputFocus} value={String(template.defaultUnitValue)} onChange={(event) => updateLaborTemplate(template.id, { defaultUnitValue: parseDecimal(event.target.value, 0) })} />
                    <TextArea className="guided-wide-field" label="Observação" value={template.note} onChange={(val) => updateLaborTemplate(template.id, { note: val })} />
                  </article>
                ))}
              </div>

              <Button variant="secondary" className="inline-action" onClick={restoreStarterLaborTemplates}>Restaurar lista padrão</Button>
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
                <article className="guided-service-card aferix-card-compact-list" key={template.id}>
                  <div>
                    <strong>{template.title}</strong>
                    <small>{formatCurrency(template.defaultUnitValue)} / {template.unit}</small>
                    <small>{template.note}</small>
                    {addedQuantity > 0 && <span className="guided-cart-count">{addedQuantity} lançado(s) neste ambiente</span>}
                  </div>
                  <div className="guided-service-controls" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginTop: '12px' }}>
                    <Input label="Qtd." inputMode="decimal" onFocus={handleNumericInputFocus} value={laborQuantityById[template.id] ?? '1'} onChange={(event) => setLaborQuantityById((current) => ({ ...current, [template.id]: event.target.value }))} />
                    <Input label="Valor" inputMode="decimal" onFocus={handleNumericInputFocus} value={laborValueById[template.id] ?? String(template.defaultUnitValue)} onChange={(event) => setLaborValueById((current) => ({ ...current, [template.id]: event.target.value }))} />
                    <Button variant="primary" className="inline-action" onClick={() => addLabor(template)}>Adicionar</Button>
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
          <div className="guided-manual-block-card aferix-card-surface">
            <div><strong>Kits automáticos</strong><small>Escolha o kit, informe a quantidade e gere materiais + serviços sugeridos no ambiente atual.</small></div>
            <div className="guided-manual-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
              <div className="guided-wide-field" style={{ flex: '1 1 100%' }}>
                <Select label="Kit" value={selectedKitId} onChange={(val) => { const id = val as KitId; setSelectedKitId(id); setKitQuantity(kitTemplates.find((kit) => kit.id === id)?.defaultQuantity ?? '1'); }}>{kitTemplates.map((kit) => <option key={kit.id} value={kit.id}>{kit.title}</option>)}</Select>
              </div>
              <Input style={{ flex: '1' }} label="Quantidade" inputMode="decimal" onFocus={handleNumericInputFocus} value={kitQuantity} onChange={(event) => setKitQuantity(event.target.value)} />
              <div style={{ flex: '1' }}>
                <Select label="Marca desejada" value={kitBrand} onChange={(val) => setKitBrand(val)}>{kitBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</Select>
              </div>
              <div style={{ flex: '1' }}>
                <Select label="Destino" value={kitDestination} onChange={(val) => setKitDestination(val as CalculationDestination)}><option value="survey">Atendimento</option><option value="budget">Orçamento</option><option value="both">Ambos</option></Select>
              </div>
            </div>
            <div className="guided-cart-summary" style={{ marginTop: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}><strong>{selectedKit.title}</strong><small>{selectedKit.description}</small></div>
            <Button variant="primary" className="inline-action" style={{ marginTop: '12px' }} onClick={addSelectedKit}>Gerar kit selecionado</Button>
          </div>

          <div className="guided-manual-block-card aferix-card-surface" style={{ marginTop: '16px' }}>
            <div><strong>Peça/material manual</strong><small>Digite qualquer material, marca, modelo, quantidade e valor.</small></div>
            <div className="guided-manual-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
              <Input className="guided-wide-field" style={{ flex: '1 1 100%' }} label="Descrição da peça" value={manualPart.title} placeholder="Ex.: chassis 4x2, tomada 20A, placa dupla..." onChange={(event) => setManualPart((current) => ({ ...current, title: event.target.value }))} />
              <Input style={{ flex: '1' }} label="Marca" value={manualPart.brand} placeholder="Ex.: Fabricante B" onChange={(event) => setManualPart((current) => ({ ...current, brand: event.target.value }))} />
              <Input style={{ flex: '1' }} label="Modelo/ref." value={manualPart.model} placeholder="Opcional" onChange={(event) => setManualPart((current) => ({ ...current, model: event.target.value }))} />
              <Input style={{ flex: '1' }} label="Quantidade" inputMode="decimal" onFocus={handleNumericInputFocus} value={manualPart.quantity} onChange={(event) => setManualPart((current) => ({ ...current, quantity: event.target.value }))} />
              <Input style={{ flex: '1' }} label="Valor unitário" inputMode="decimal" onFocus={handleNumericInputFocus} value={manualPart.unitValue} placeholder="0,00" onChange={(event) => setManualPart((current) => ({ ...current, unitValue: event.target.value }))} />
              <div style={{ flex: '1' }}>
                <Select label="Destino" value={manualPart.destination} onChange={(val) => setManualPart((current) => ({ ...current, destination: val as CalculationDestination }))}><option value="survey">Atendimento</option><option value="budget">Orçamento</option><option value="both">Ambos</option></Select>
              </div>
              <div className="guided-wide-field" style={{ flex: '1 1 100%' }}>
                <TextArea label="Observação" value={manualPart.note} placeholder="Ex.: confirmar disponibilidade, usar 20A na cozinha..." onChange={(val) => setManualPart((current) => ({ ...current, note: val }))} />
              </div>
            </div>
            <Button variant="primary" className="inline-action" style={{ marginTop: '12px' }} onClick={addManualPart}>
              Adicionar peça manual
            </Button>
          </div>

          <div className="parts-catalog-panel aferix-card-surface" style={{ marginTop: '16px' }}>
            <div className="parts-search-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Input
                className="technical-edit-field parts-search-wide"
                style={{ flex: '1 1 100%' }}
                label="Buscar na base interna"
                value={partQuery}
                placeholder="Ex.: tomada 20A, disjuntor bipolar..."
                onChange={(event) => setPartQuery(event.target.value)}
              />
              <div className="technical-edit-field" style={{ flex: '1' }}>
                <Select
                  label="Marca"
                  value={partBrand}
                  onChange={(val) => setPartBrand(val)}
                >
                  <option value="">Todas</option>
                  {catalogPartBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </Select>
              </div>
              <div className="technical-edit-field" style={{ flex: '1' }}>
                <Select
                  label="Categoria"
                  value={partCategory}
                  onChange={(val) => setPartCategory(val)}
                >
                  <option value="">Todas</option>
                  {catalogPartCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="parts-results-header" style={{ marginTop: '16px' }}>
              <strong>{hasPartLookup ? `${partResults.length} peça(s) encontrada(s)` : 'Pesquise para exibir peças'}</strong>
              <small>Resultados aparecem apenas após busca ou filtro.</small>
            </div>
            <div className="parts-result-list" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {partResults.map((part) => {
                const addedQuantity = quantityInCurrentEnvironment(part.title, 'material');
                return (
                  <article className="part-result-card aferix-card-compact-list" key={part.id}>
                    <div className="part-result-main">
                      <span>{part.brand}</span>
                      <strong>{part.title}</strong>
                      <small>{[part.line, part.category, part.subcategory, part.current, part.voltage].filter(Boolean).join(' · ')}</small>
                      {addedQuantity > 0 && <span className="guided-cart-count">{addedQuantity} lançado(s) neste ambiente</span>}
                    </div>
                    <div className="part-result-controls">
                      <Button
                        variant="primary"
                        className="inline-action"
                        onClick={() => addCatalogPart(part)}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </>
      )}

      {showManual && mode === 'manual' && <div className="guided-manual-block-card"><div><strong>Bloco manual rápido</strong><small>Para observações livres, use a aba Peças com descrição personalizada.</small></div></div>}

      <div className="guided-cart-summary grouped-summary">
        <strong>Resumo por ambiente</strong>
        {environmentGroups.length === 0 ? (
          <small>Nenhum item adicionado ainda.</small>
        ) : (
          <div className="environment-summary-list">
            {environmentGroups.map((group) => (
              <article className="environment-summary-card aferix-card-surface" key={group.name}>
                <header>
                  <div>
                    <strong>{group.name}</strong>
                    <small>{group.itemCount} tipo(s) · {group.totalQuantity} unidade(s)</small>
                  </div>
                  <b>{formatCurrency(group.subtotal)}</b>
                </header>
                <div className="environment-subtotals">
                  <span>Materiais: {formatCurrency(group.materialSubtotal)}</span>
                  <span>Serviços: {formatCurrency(group.serviceSubtotal)}</span>
                </div>
                <div className="environment-line-preview">
                  {group.lines.slice(0, 5).map((line) => (
                    <span key={line.id}>{line.quantity}× {line.description}</span>
                  ))}
                  {group.lines.length > 5 && <span>+ {group.lines.length - 5} item(ns)</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {environmentGroups.length > 0 && (
        <div className="environment-grouped-editor">
          {environmentGroups.map((group) => (
            <section className="environment-editor-group" key={group.name}>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span>Ambiente</span>
                  <strong>{group.name}</strong>
                </div>
                <div className="environment-header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <b>{formatCurrency(group.subtotal)}</b>
                  <Button variant="primary" className="inline-action env-send-btn" onClick={() => sendEnvironment(group.name)}>
                    Enviar este ambiente
                  </Button>
                </div>
              </header>
              <div className="parts-result-list">
                {group.lines.map((line) => (
                  <article className="part-result-card active aferix-card-compact-list" key={line.id}>
                    <div className="part-result-main">
                      <span>{kindLabel(line.kind)} · {line.itemType === 'material' ? 'Material' : 'Serviço'}</span>
                      <strong>{line.description}</strong>
                      <small>{line.brand ? `${line.brand}${line.model ? ` · ${line.model}` : ''}` : line.note}</small>
                    </div>
                    <div className="part-result-controls" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                      <Input
                        label="Qtd."
                        inputMode="decimal"
                        onFocus={handleNumericInputFocus}
                        value={String(line.quantity)}
                        onChange={(event) => updateLineQuantity(line.id, event.target.value)}
                      />
                      <Input
                        label="Valor"
                        inputMode="decimal"
                        onFocus={handleNumericInputFocus}
                        value={String(line.unitValue)}
                        onChange={(event) => updateLineUnitValue(line.id, event.target.value)}
                      />
                      <Button variant="secondary" className="inline-action" onClick={() => duplicateLine(line)}>
                        Duplicar
                      </Button>
                      <Button variant="danger" onClick={() => removeLine(line.id)}>
                        Remover
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="guided-cart-actions" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <Button variant="primary" className="inline-action" disabled={lines.length === 0} onClick={sendAll}>
          Enviar itens ao fluxo
        </Button>
        <Button variant="secondary" className="inline-action" disabled={lines.length === 0} onClick={() => setLines([])}>
          Limpar itens
        </Button>
      </div>
      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
