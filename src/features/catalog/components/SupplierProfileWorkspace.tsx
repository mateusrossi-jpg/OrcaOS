import { useEffect, useMemo, useState } from 'react';
import {
  createSupplierProfileId,
  loadSupplierProfiles,
  saveSupplierProfiles,
  type SupplierProfile,
} from '../storage/supplierProfileStorage';
import './SupplierProfileWorkspace.css';

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
      : profiles;
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
      <div className="supplier-profile-header">
        <div>
          <span className="orca-kicker">Fornecedores fiscais</span>
          <h2>Cadastro fiscal e gerencial de fornecedores</h2>
          <p>Guarde dados da empresa, contato, condições de compra, prazos e observações fiscais para compras, estoque e relatórios.</p>
        </div>
        <strong>{profiles.length} fornecedor(es)</strong>
      </div>

      <div className="supplier-profile-card">
        <div>
          <strong>{editingId ? 'Editar fornecedor' : 'Novo fornecedor'}</strong>
          <small>Use para compras de estoque, comparação de fornecedores, relatórios e histórico de aquisição.</small>
        </div>
        <div className="supplier-profile-grid">
          <label><span>Nome/razão social</span><input value={draft.name} placeholder="Ex.: Loja Elétrica Central" onChange={(event) => updateDraft('name', event.target.value)} /></label>
          <label><span>CNPJ/CPF</span><input value={draft.document} placeholder="Opcional" onChange={(event) => updateDraft('document', event.target.value)} /></label>
          <label><span>Inscrição estadual</span><input value={draft.stateRegistration} placeholder="Opcional" onChange={(event) => updateDraft('stateRegistration', event.target.value)} /></label>
          <label><span>Segmento</span><input value={draft.segment} placeholder="Materiais elétricos, hidráulica..." onChange={(event) => updateDraft('segment', event.target.value)} /></label>
          <label><span>Cidade</span><input value={draft.city} placeholder="Ex.: Campinas" onChange={(event) => updateDraft('city', event.target.value)} /></label>
          <label><span>UF</span><input value={draft.state} placeholder="SP" maxLength={2} onChange={(event) => updateDraft('state', event.target.value.toUpperCase())} /></label>
          <label><span>Contato</span><input value={draft.contactName} placeholder="Nome do vendedor/atendente" onChange={(event) => updateDraft('contactName', event.target.value)} /></label>
          <label><span>Telefone/WhatsApp</span><input value={draft.phone} placeholder="Opcional" onChange={(event) => updateDraft('phone', event.target.value)} /></label>
          <label><span>E-mail</span><input value={draft.email} placeholder="Opcional" onChange={(event) => updateDraft('email', event.target.value)} /></label>
          <label><span>Site</span><input value={draft.websiteUrl} placeholder="https://..." onChange={(event) => updateDraft('websiteUrl', event.target.value)} /></label>
          <label><span>Catálogo</span><input value={draft.catalogUrl} placeholder="https://..." onChange={(event) => updateDraft('catalogUrl', event.target.value)} /></label>
          <label><span>Prazo médio</span><input inputMode="numeric" value={draft.averageDeliveryDays} placeholder="dias" onChange={(event) => updateDraft('averageDeliveryDays', event.target.value)} /></label>
          <label className="wide"><span>Condições de pagamento</span><input value={draft.paymentTerms} placeholder="Ex.: Pix à vista, boleto 28 dias, cartão..." onChange={(event) => updateDraft('paymentTerms', event.target.value)} /></label>
          <label className="wide"><span>Observações fiscais</span><textarea value={draft.defaultTaxNotes} placeholder="Ex.: conferir ICMS/ST, monofásico, NCM, CFOP, compra para revenda..." onChange={(event) => updateDraft('defaultTaxNotes', event.target.value)} /></label>
          <label className="wide"><span>Observações de compra</span><textarea value={draft.purchaseNotes} placeholder="Ex.: melhor preço em quantidade, entrega rápida, vendedor X, desconto para CNPJ..." onChange={(event) => updateDraft('purchaseNotes', event.target.value)} /></label>
        </div>
        <div className="supplier-profile-actions">
          <button className="primary-action inline-action" type="button" onClick={saveProfile}>{editingId ? 'Salvar alterações' : 'Cadastrar fornecedor'}</button>
          {editingId && <button className="secondary-action inline-action" type="button" onClick={resetForm}>Cancelar edição</button>}
        </div>
      </div>

      <div className="supplier-profile-card">
        <div>
          <strong>Fornecedores cadastrados</strong>
          <small>Edite, duplique ou remova fornecedores usados no controle de compras.</small>
        </div>
        <label className="supplier-profile-search"><span>Buscar fornecedor</span><input value={query} placeholder="Nome, CNPJ, cidade, segmento..." onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="supplier-profile-list">
          {filteredProfiles.length === 0 && <div className="supplier-profile-empty">Nenhum fornecedor encontrado com essa busca.</div>}
          {visibleProfiles.map((profile) => (
            <article className="supplier-profile-item" key={profile.id}>
              <div>
                <span>{profile.segment}</span>
                <strong>{profile.name}</strong>
                <small>{[profile.document, profile.city, profile.state, profile.phone].filter(Boolean).join(' · ') || 'Sem dados complementares'}</small>
                <small>{profile.paymentTerms || profile.purchaseNotes || 'Sem condições/observações cadastradas'}</small>
              </div>
              <div className="supplier-profile-actions compact-actions">
                {profile.websiteUrl && <a className="secondary-action inline-action" href={profile.websiteUrl} target="_blank" rel="noreferrer">Site</a>}
                {profile.catalogUrl && <a className="secondary-action inline-action" href={profile.catalogUrl} target="_blank" rel="noreferrer">Catálogo</a>}
                <button className="secondary-action inline-action" type="button" onClick={() => editProfile(profile)}>Editar</button>
                <button className="secondary-action inline-action" type="button" onClick={() => duplicateProfile(profile)}>Duplicar</button>
                <button className="danger-action" type="button" onClick={() => removeProfile(profile.id)}>Remover</button>
              </div>
            </article>
          ))}
          {hiddenProfileCount > 0 && <div className="supplier-profile-empty">Mais {hiddenProfileCount} fornecedor(es) oculto(s). Use a busca para refinar.</div>}
        </div>
      </div>

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
