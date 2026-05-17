import { useEffect, useMemo, useState } from 'react';
import {
  createSupplierProfileId,
  loadSupplierProfiles,
  saveSupplierProfiles,
  type SupplierProfile,
} from '../storage/supplierProfileStorage';

interface SupplierProfileDraft {
  name: string;
  document: string;
  stateRegistration: string;
  segment: string;
  city: string;
  state: string;
  contactName: string;
  phone: string;
  email: string;
  websiteUrl: string;
  catalogUrl: string;
  paymentTerms: string;
  averageDeliveryDays: string;
  defaultTaxNotes: string;
  purchaseNotes: string;
}

const emptyDraft: SupplierProfileDraft = {
  name: '',
  document: '',
  stateRegistration: '',
  segment: '',
  city: '',
  state: '',
  contactName: '',
  phone: '',
  email: '',
  websiteUrl: '',
  catalogUrl: '',
  paymentTerms: '',
  averageDeliveryDays: '',
  defaultTaxNotes: '',
  purchaseNotes: '',
};

const SUPPLIER_PROFILE_VISIBLE_LIMIT = 5;

function parseInteger(value: string): number | undefined {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function draftToProfile(draft: SupplierProfileDraft, existing?: SupplierProfile): SupplierProfile | null {
  const name = draft.name.trim();
  const document = draft.document.trim();
  if (!name) return null;
  const timestamp = new Date().toISOString();

  return {
    id: existing?.id ?? createSupplierProfileId(),
    name,
    document,
    stateRegistration: draft.stateRegistration.trim() || undefined,
    segment: draft.segment.trim() || 'Fornecedor geral',
    city: draft.city.trim() || undefined,
    state: draft.state.trim() || undefined,
    contactName: draft.contactName.trim() || undefined,
    phone: draft.phone.trim() || undefined,
    email: draft.email.trim() || undefined,
    websiteUrl: draft.websiteUrl.trim() || undefined,
    catalogUrl: draft.catalogUrl.trim() || undefined,
    paymentTerms: draft.paymentTerms.trim() || undefined,
    averageDeliveryDays: parseInteger(draft.averageDeliveryDays),
    defaultTaxNotes: draft.defaultTaxNotes.trim() || undefined,
    purchaseNotes: draft.purchaseNotes.trim() || undefined,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

function profileToDraft(profile: SupplierProfile): SupplierProfileDraft {
  return {
    name: profile.name,
    document: profile.document,
    stateRegistration: profile.stateRegistration ?? '',
    segment: profile.segment,
    city: profile.city ?? '',
    state: profile.state ?? '',
    contactName: profile.contactName ?? '',
    phone: profile.phone ?? '',
    email: profile.email ?? '',
    websiteUrl: profile.websiteUrl ?? '',
    catalogUrl: profile.catalogUrl ?? '',
    paymentTerms: profile.paymentTerms ?? '',
    averageDeliveryDays: profile.averageDeliveryDays ? String(profile.averageDeliveryDays) : '',
    defaultTaxNotes: profile.defaultTaxNotes ?? '',
    purchaseNotes: profile.purchaseNotes ?? '',
  };
}

export function SupplierProfileWorkspace() {
  const [profiles, setProfiles] = useState<SupplierProfile[]>(() => loadSupplierProfiles());
  const [draft, setDraft] = useState<SupplierProfileDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => saveSupplierProfiles(profiles), [profiles]);

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const source = normalizedQuery
      ? profiles.filter((profile) => [profile.name, profile.document, profile.segment, profile.city, profile.state, profile.phone, profile.email, profile.purchaseNotes, profile.defaultTaxNotes].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery))
      : [];
    return [...source].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [profiles, query]);
  const visibleProfiles = filteredProfiles.slice(0, SUPPLIER_PROFILE_VISIBLE_LIMIT);
  const hiddenProfileCount = Math.max(filteredProfiles.length - visibleProfiles.length, 0);

  function updateDraft<K extends keyof SupplierProfileDraft>(key: K, value: SupplierProfileDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function saveProfile() {
    const existing = editingId ? profiles.find((profile) => profile.id === editingId) : undefined;
    const nextProfile = draftToProfile(draft, existing);
    if (!nextProfile) {
      setFeedback('Informe ao menos o nome do fornecedor.');
      return;
    }

    if (editingId) {
      setProfiles((current) => current.map((profile) => (profile.id === editingId ? nextProfile : profile)));
      setFeedback('Fornecedor atualizado.');
    } else {
      setProfiles((current) => [nextProfile, ...current]);
      setFeedback('Fornecedor cadastrado.');
    }
    resetForm();
  }

  function editProfile(profile: SupplierProfile) {
    setDraft(profileToDraft(profile));
    setEditingId(profile.id);
    setFeedback(`Editando ${profile.name}.`);
  }

  function duplicateProfile(profile: SupplierProfile) {
    const timestamp = new Date().toISOString();
    const copy: SupplierProfile = {
      ...profile,
      id: createSupplierProfileId(),
      name: `${profile.name} cópia`,
      document: '',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setProfiles((current) => [copy, ...current]);
    setFeedback(`${copy.name} foi duplicado.`);
  }

  function removeProfile(id: string) {
    setProfiles((current) => current.filter((profile) => profile.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <section className="supplier-profile-workspace">
      <div className="catalog-tab-hero">
        <div>
          <span className="catalog-eyebrow">Fornecedores fiscais</span>
          <h3>Cadastro fiscal e gerencial</h3>
          <p>Guarde dados da empresa, contato, condições de compra, prazos e observações fiscais para compras, estoque e relatórios.</p>
        </div>
        <strong>{profiles.length} fornecedor(es)</strong>
      </div>

      <div className="catalog-form-card">
        <header>
          <div>
            <h4>{editingId ? 'Editar fornecedor' : 'Novo fornecedor'}</h4>
            <p>Use para compras de estoque, comparação de fornecedores, relatórios e histórico de aquisição.</p>
          </div>
        </header>
        <div className="catalog-form-grid">
          <div className="catalog-field col-4">
            <span>Nome/razão social</span>
            <input value={draft.name} placeholder="Ex.: Fornecedor principal" onChange={(event) => updateDraft('name', event.target.value)} />
          </div>
          <div className="catalog-field col-4">
            <span>CNPJ/CPF</span>
            <input value={draft.document} placeholder="Opcional" onChange={(event) => updateDraft('document', event.target.value)} />
          </div>
          <div className="catalog-field col-4">
            <span>Inscrição estadual</span>
            <input value={draft.stateRegistration} placeholder="Opcional" onChange={(event) => updateDraft('stateRegistration', event.target.value)} />
          </div>
          <div className="catalog-field col-4">
            <span>Segmento</span>
            <input value={draft.segment} placeholder="Materiais elétricos, hidráulica..." onChange={(event) => updateDraft('segment', event.target.value)} />
          </div>
          <div className="catalog-field col-4">
            <span>Cidade</span>
            <input value={draft.city} placeholder="Ex.: Campinas" onChange={(event) => updateDraft('city', event.target.value)} />
          </div>
          <div className="catalog-field col-4">
            <span>UF</span>
            <input value={draft.state} placeholder="SP" maxLength={2} onChange={(event) => updateDraft('state', event.target.value.toUpperCase())} />
          </div>
          <div className="catalog-field col-4">
            <span>Contato</span>
            <input value={draft.contactName} placeholder="Nome do vendedor/atendente" onChange={(event) => updateDraft('contactName', event.target.value)} />
          </div>
          <div className="catalog-field col-4">
            <span>Telefone/WhatsApp</span>
            <input value={draft.phone} placeholder="Opcional" onChange={(event) => updateDraft('phone', event.target.value)} />
          </div>
          <div className="catalog-field col-4">
            <span>E-mail</span>
            <input value={draft.email} placeholder="Opcional" onChange={(event) => updateDraft('email', event.target.value)} />
          </div>
          <div className="catalog-field col-12">
            <span>Site</span>
            <input value={draft.websiteUrl} placeholder="https://..." onChange={(event) => updateDraft('websiteUrl', event.target.value)} />
          </div>
          <div className="catalog-field col-12">
            <span>Catálogo</span>
            <input value={draft.catalogUrl} placeholder="https://..." onChange={(event) => updateDraft('catalogUrl', event.target.value)} />
          </div>
          <div className="catalog-field col-12">
            <span>Prazo médio</span>
            <input inputMode="numeric" value={draft.averageDeliveryDays} placeholder="dias" onChange={(event) => updateDraft('averageDeliveryDays', event.target.value)} />
          </div>
          <div className="catalog-field col-12">
            <span>Condições de pagamento</span>
            <input value={draft.paymentTerms} placeholder="Ex.: Pix à vista, boleto 28 dias, cartão..." onChange={(event) => updateDraft('paymentTerms', event.target.value)} />
          </div>
          <div className="catalog-field col-12">
            <span>Observações fiscais</span>
            <textarea value={draft.defaultTaxNotes} placeholder="Ex.: conferir ICMS/ST, monofásico, NCM, CFOP, compra para revenda..." onChange={(event) => updateDraft('defaultTaxNotes', event.target.value)} />
          </div>
          <div className="catalog-field col-12">
            <span>Observações de compra</span>
            <textarea value={draft.purchaseNotes} placeholder="Ex.: melhor preço em quantidade, entrega rápida, vendedor X, desconto para CNPJ..." onChange={(event) => updateDraft('purchaseNotes', event.target.value)} />
          </div>
        </div>
        <div className="catalog-hub-actions start-actions" style={{ marginTop: '16px' }}>
          <button className="primary-action inline-action" type="button" onClick={saveProfile}>{editingId ? 'Salvar alterações' : 'Cadastrar fornecedor'}</button>
          {editingId && <button className="secondary-action inline-action" type="button" onClick={resetForm}>Cancelar edição</button>}
        </div>
      </div>

      <div className="aferix-panel-card catalog-list-card">
        <header>
          <div>
            <h4>Fornecedores cadastrados</h4>
            <p>Edite, duplique ou remova fornecedores usados no controle de compras.</p>
          </div>
        </header>
        <div className="catalog-form-grid" style={{ marginBottom: '16px' }}>
          <div className="catalog-field col-12">
            <span>Buscar fornecedor</span>
            <input value={query} placeholder="Nome, CNPJ, cidade, segmento..." onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
        <div className="continuous-list">
          {profiles.length === 0 ? (
            <div className="continuous-list-empty">Nenhum fornecedor cadastrado ainda.</div>
          ) : !query.trim() ? (
            <div className="continuous-list-empty">{profiles.length} fornecedor(es) salvo(s). Pesquise para exibir.</div>
          ) : filteredProfiles.length === 0 ? (
            <div className="continuous-list-empty">Nenhum fornecedor encontrado com essa busca.</div>
          ) : null}
          {visibleProfiles.map((profile) => (
            <article className="continuous-list-item" key={profile.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '16px' }}>
              <div className="client-col">
                <span className="catalog-eyebrow" style={{ fontSize: '0.68rem', marginBottom: '2px' }}>{profile.segment}</span>
                <strong>{profile.name}</strong>
                <small>{[profile.document, profile.city, profile.state, profile.phone].filter(Boolean).join(' · ') || 'Sem dados complementares'}</small>
                <small>{profile.paymentTerms || profile.purchaseNotes || 'Sem condições/observações cadastradas'}</small>
              </div>
              <div className="catalog-row-actions">
                {profile.websiteUrl && <a className="ghost-action" href={profile.websiteUrl} target="_blank" rel="noreferrer" style={{ minHeight: '32px', fontSize: '0.7rem' }}>Site</a>}
                {profile.catalogUrl && <a className="ghost-action" href={profile.catalogUrl} target="_blank" rel="noreferrer" style={{ minHeight: '32px', fontSize: '0.7rem' }}>Catálogo</a>}
                <button className="ghost-action" type="button" onClick={() => editProfile(profile)} style={{ minHeight: '32px', fontSize: '0.7rem' }}>Editar</button>
                <button className="ghost-action" type="button" onClick={() => duplicateProfile(profile)} style={{ minHeight: '32px', fontSize: '0.7rem' }}>Duplicar</button>
                <button className="danger-action" type="button" onClick={() => removeProfile(profile.id)} style={{ minHeight: '32px', fontSize: '0.7rem', padding: '0 8px', borderRadius: '4px' }}>Remover</button>
              </div>
            </article>
          ))}
          {hiddenProfileCount > 0 && <div className="continuous-list-empty">Mais {hiddenProfileCount} fornecedor(es) oculto(s). Use a busca para refinar.</div>}
        </div>
      </div>

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
