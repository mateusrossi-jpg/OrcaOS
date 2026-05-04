import { useState, type ChangeEvent } from 'react';
import type { BudgetTemplateId, ReportTemplateId } from '../../../core/types/business';
import { budgetTemplateOptions } from '../../budgets/budgetTemplatesVisual';
import { loadBusinessProfile, saveBusinessProfile } from '../../budgets/storage/businessProfileStorage';
import {
  loadProfessionalProfile,
  resetProfessionalProfileIds,
  saveProfessionalProfile,
  type ProfessionalProfile,
} from '../storage/professionalProfileStorage';
import './ProfessionalProfileWorkspace.css';

const professionalAreas = [
  'Elétrica',
  'Hidráulica',
  'Pintura',
  'Construção civil',
  'Refrigeração',
  'Automação',
  'Eletrônica',
  'Motores e rebobinagem',
  'Multisserviços',
  'Outro',
];

const reportTemplateOptions: Array<{ id: ReportTemplateId; title: string; description: string; plan: 'free' | 'pro' }> = [
  { id: 'technicalSimple', title: 'Relatório técnico simples', description: 'Documento limpo para diagnóstico, observações e itens técnicos essenciais.', plan: 'free' },
  { id: 'technicalDetailed', title: 'Relatório técnico detalhado', description: 'Medições, recomendações, riscos, itens inclusos e histórico técnico.', plan: 'pro' },
  { id: 'managerial', title: 'Relatório gerencial', description: 'Visão de aprovação, ticket médio, recorrência e indicadores do profissional.', plan: 'pro' },
];

function syncProfileToBusinessProfile(profile: ProfessionalProfile) {
  const currentBusinessProfile = loadBusinessProfile();
  const location = [profile.city, profile.state].filter(Boolean).join(' / ');
  const address = [profile.address, location].filter(Boolean).join(' - ');

  saveBusinessProfile({
    ...currentBusinessProfile,
    businessName: profile.businessName || profile.professionalName || currentBusinessProfile.businessName,
    documentNumber: profile.document || currentBusinessProfile.documentNumber,
    phone: profile.phone || currentBusinessProfile.phone,
    email: profile.email || currentBusinessProfile.email,
    address: address || currentBusinessProfile.address,
    logoUrl: profile.logoUrl || currentBusinessProfile.logoUrl,
    logoDataUrl: profile.logoDataUrl || currentBusinessProfile.logoDataUrl,
    responsibleName: profile.professionalName || currentBusinessProfile.responsibleName,
    defaultNotes: profile.commercialNotes || currentBusinessProfile.defaultNotes,
    defaultPaymentTerms: profile.defaultPaymentTerms || currentBusinessProfile.defaultPaymentTerms,
    defaultValidity: profile.defaultValidity || currentBusinessProfile.defaultValidity,
    defaultGuarantee: profile.defaultGuarantee || currentBusinessProfile.defaultGuarantee,
    defaultExecutionDeadline: profile.defaultExecutionDeadline || currentBusinessProfile.defaultExecutionDeadline,
    defaultBudgetTemplateId: profile.defaultBudgetTemplateId || currentBusinessProfile.defaultBudgetTemplateId,
    defaultReportTemplateId: profile.defaultReportTemplateId || currentBusinessProfile.defaultReportTemplateId,
  });
}

export function ProfessionalProfileWorkspace() {
  const [profile, setProfile] = useState<ProfessionalProfile>(() => loadProfessionalProfile());
  const [feedback, setFeedback] = useState<string | null>(null);

  function updateProfile<K extends keyof ProfessionalProfile>(key: K, value: ProfessionalProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function saveProfile() {
    saveProfessionalProfile(profile);
    syncProfileToBusinessProfile(profile);
    setFeedback('Perfil salvo e sincronizado com a identidade do orçamento/PDF.');
  }

  function handleLogoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfile((current) => ({ ...current, logoDataUrl: reader.result as string, logoUrl: '' }));
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function removeLogo() {
    setProfile((current) => ({ ...current, logoUrl: '', logoDataUrl: '' }));
  }

  function regenerateIds() {
    const nextProfile = resetProfessionalProfileIds(profile);
    setProfile(nextProfile);
    saveProfessionalProfile(nextProfile);
    syncProfileToBusinessProfile(nextProfile);
    setFeedback('Novos IDs locais foram gerados para profissional e empresa.');
  }

  return (
    <section className="professional-profile-workspace">
      <div className="professional-profile-header">
        <div>
          <span className="orca-kicker">Dados empresariais</span>
          <h2>Identidade da empresa</h2>
          <p>Centralize logo, dados comerciais e padrões de documentos usados em orçamentos, relatórios, OS, backup e futura sincronização.</p>
        </div>
        <strong>{profile.mainArea || 'Área não definida'}</strong>
      </div>

      <div className="professional-profile-card id-card">
        <div className="professional-card-heading">
          <strong>IDs locais</strong>
          <small>Esses IDs preparam o OrçaOS para login, licença, backup em nuvem e OrçaOS Cliente no futuro.</small>
        </div>
        <div className="professional-id-grid">
          <article>
            <span>ID profissional</span>
            <code>{profile.professionalId}</code>
          </article>
          <article>
            <span>ID empresa</span>
            <code>{profile.companyId}</code>
          </article>
        </div>
        <button className="secondary-action inline-action" type="button" onClick={regenerateIds}>Gerar novos IDs locais</button>
      </div>

      <div className="professional-profile-card">
        <div className="professional-card-heading">
          <strong>Dados da empresa e profissional</strong>
          <small>Este é o ponto único para editar identidade, logo e informações que aparecem nos documentos.</small>
        </div>
        <div className="professional-logo-editor">
          <div className="professional-logo-preview">
            {profile.logoDataUrl || profile.logoUrl ? <img src={profile.logoDataUrl || profile.logoUrl} alt="Logo profissional" /> : <span>Sem logo</span>}
          </div>
          <div className="professional-logo-copy">
            <strong>Logo dos documentos</strong>
            <small>Use uma imagem simples e horizontal sempre que possível. Ela aparece em orçamento e relatório.</small>
            <div className="professional-profile-actions">
              <label className="secondary-action inline-action file-action">Escolher logo<input accept="image/*" type="file" onChange={handleLogoFileChange} /></label>
              {(profile.logoDataUrl || profile.logoUrl) && <button className="danger-action" type="button" onClick={removeLogo}>Remover logo</button>}
            </div>
          </div>
        </div>
        <div className="professional-profile-grid">
          <label>
            <span>Nome profissional</span>
            <input value={profile.professionalName} placeholder="Ex.: Profissional técnico" onChange={(event) => updateProfile('professionalName', event.target.value)} />
          </label>
          <label>
            <span>Nome comercial / empresa</span>
            <input value={profile.businessName} placeholder="Ex.: Rossi Elétrica" onChange={(event) => updateProfile('businessName', event.target.value)} />
          </label>
          <label>
            <span>CPF/CNPJ</span>
            <input value={profile.document} placeholder="Opcional" onChange={(event) => updateProfile('document', event.target.value)} />
          </label>
          <label>
            <span>Telefone/WhatsApp</span>
            <input value={profile.phone} placeholder="Opcional" onChange={(event) => updateProfile('phone', event.target.value)} />
          </label>
          <label>
            <span>E-mail</span>
            <input value={profile.email} placeholder="Opcional" onChange={(event) => updateProfile('email', event.target.value)} />
          </label>
          <label className="wide">
            <span>Endereço</span>
            <input value={profile.address} placeholder="Rua, número, bairro" onChange={(event) => updateProfile('address', event.target.value)} />
          </label>
          <label>
            <span>Cidade</span>
            <input value={profile.city} placeholder="Ex.: São José do Rio Preto" onChange={(event) => updateProfile('city', event.target.value)} />
          </label>
          <label>
            <span>UF</span>
            <input value={profile.state} placeholder="SP" maxLength={2} onChange={(event) => updateProfile('state', event.target.value.toUpperCase())} />
          </label>
          <label>
            <span>Área principal</span>
            <select value={profile.mainArea} onChange={(event) => updateProfile('mainArea', event.target.value)}>
              {professionalAreas.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>
          </label>
          <label className="wide">
            <span>Logo por URL opcional</span>
            <input value={profile.logoUrl} placeholder="https://.../logo.png" onChange={(event) => updateProfile('logoUrl', event.target.value)} />
          </label>
        </div>
      </div>

      <div className="professional-profile-card">
        <div className="professional-card-heading">
          <strong>Padrões dos documentos</strong>
          <small>Orçamentos novos usam estes textos como ponto de partida. Você ainda pode editar cada proposta.</small>
        </div>
        <div className="professional-profile-grid">
          <label>
            <span>Validade padrão</span>
            <input value={profile.defaultValidity} placeholder="Ex.: 7 dias" onChange={(event) => updateProfile('defaultValidity', event.target.value)} />
          </label>
          <label>
            <span>Garantia padrão</span>
            <input value={profile.defaultGuarantee} placeholder="Ex.: 90 dias para mão de obra" onChange={(event) => updateProfile('defaultGuarantee', event.target.value)} />
          </label>
          <label>
            <span>Prazo padrão</span>
            <input value={profile.defaultExecutionDeadline} placeholder="Ex.: 3 dias úteis após aprovação" onChange={(event) => updateProfile('defaultExecutionDeadline', event.target.value)} />
          </label>
          <label>
            <span>Modelo padrão de orçamento/PDF</span>
            <select value={profile.defaultBudgetTemplateId} onChange={(event) => updateProfile('defaultBudgetTemplateId', event.target.value as BudgetTemplateId)}>
              {budgetTemplateOptions.map((template) => <option key={template.id} value={template.id}>{template.plan === 'pro' ? 'Pro - ' : 'Free - '}{template.title}</option>)}
            </select>
          </label>
          <label>
            <span>Modelo padrão de relatório</span>
            <select value={profile.defaultReportTemplateId} onChange={(event) => updateProfile('defaultReportTemplateId', event.target.value as ReportTemplateId)}>
              {reportTemplateOptions.map((template) => <option key={template.id} value={template.id}>{template.plan === 'pro' ? 'Pro - ' : 'Free - '}{template.title}</option>)}
            </select>
          </label>
          <label className="wide">
            <span>Condições padrão de pagamento</span>
            <textarea value={profile.defaultPaymentTerms} placeholder="Ex.: 50% na aprovação e 50% na entrega" onChange={(event) => updateProfile('defaultPaymentTerms', event.target.value)} />
          </label>
          <div className="professional-template-hint wide">
            <strong>Modelos Pro ficam preparados para liberação comercial.</strong>
            <small>Durante o beta, o modelo simples continua seguro para todos. Ao ativar Pro, estes padrões passam a controlar a apresentação dos documentos.</small>
          </div>
          <label className="wide">
            <span>Observações comerciais</span>
            <textarea value={profile.commercialNotes} placeholder="Ex.: atende residencial e comercial, preferência por obras de alto padrão, condições padrão de orçamento..." onChange={(event) => updateProfile('commercialNotes', event.target.value)} />
          </label>
        </div>
        <button className="primary-action inline-action" type="button" onClick={saveProfile}>Salvar dados empresariais</button>
      </div>

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
