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
  'Manutenção técnica',
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
    <div className="professional-profile-workspace" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="aferix-panel-card">
        <header>
          <div>
            <span className="orca-kicker">Empresa</span>
            <h2>Perfil Profissional</h2>
          </div>
        </header>
      </div>

      <div className="aferix-panel-card">
        <header>
          <div>
            <h2>IDs de Identificação</h2>
          </div>
        </header>
        <div className="dashboard-finance-tiles" style={{ padding: '1.5rem' }}>
          <article className="finance-tile">
            <span>Profissional</span>
            <code>{profile.professionalId}</code>
          </article>
          <article className="finance-tile">
            <span>Empresa</span>
            <code>{profile.companyId}</code>
          </article>
        </div>
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <button className="ghost-action" type="button" onClick={regenerateIds}>Renovar Identificadores</button>
        </div>
      </div>

      <div className="aferix-panel-card">
        <header>
          <div>
            <h2>Dados Comerciais</h2>
          </div>
        </header>
        <div className="professional-logo-editor" style={{ padding: '1.5rem', borderBottom: '1px solid #222' }}>
          <div className="professional-logo-preview">
            {profile.logoDataUrl || profile.logoUrl ? <img src={profile.logoDataUrl || profile.logoUrl} alt="Logo" /> : <div style={{ width: '80px', height: '40px', background: '#222', borderRadius: '4px', display: 'grid', placeItems: 'center', fontSize: '0.6rem', color: '#666' }}>SEM LOGO</div>}
          </div>
          <div className="professional-logo-copy">
            <div className="professional-profile-actions" style={{ marginTop: '0.5rem' }}>
              <label className="ghost-action file-action">Upload Logo<input accept="image/*" type="file" onChange={handleLogoFileChange} style={{ display: 'none' }} /></label>
              {(profile.logoDataUrl || profile.logoUrl) && <button className="ghost-action" type="button" onClick={removeLogo} style={{ color: '#ef4444' }}>Remover</button>}
            </div>
          </div>
        </div>
        <div className="professional-profile-grid" style={{ padding: '1.5rem' }}>
          <label className="budget-field"><span>Nome Profissional</span><input value={profile.professionalName} onChange={(event) => updateProfile('professionalName', event.target.value)} /></label>
          <label className="budget-field"><span>Nome Empresa</span><input value={profile.businessName} onChange={(event) => updateProfile('businessName', event.target.value)} /></label>
          <label className="budget-field"><span>Documento</span><input value={profile.document} onChange={(event) => updateProfile('document', event.target.value)} /></label>
          <label className="budget-field"><span>WhatsApp</span><input value={profile.phone} onChange={(event) => updateProfile('phone', event.target.value)} /></label>
          <label className="budget-field wide"><span>Endereço Completo</span><input value={profile.address} onChange={(event) => updateProfile('address', event.target.value)} /></label>
        </div>
      </div>

      <div className="aferix-panel-card">
        <header>
          <div>
            <h2>Padrões de Propostas</h2>
          </div>
        </header>
        <div className="professional-profile-grid" style={{ padding: '1.5rem' }}>
          <label className="budget-field"><span>Validade</span><input value={profile.defaultValidity} onChange={(event) => updateProfile('defaultValidity', event.target.value)} /></label>
          <label className="budget-field"><span>Garantia</span><input value={profile.defaultGuarantee} onChange={(event) => updateProfile('defaultGuarantee', event.target.value)} /></label>
          <label className="budget-field wide"><span>Condições de Pagamento</span><textarea value={profile.defaultPaymentTerms} onChange={(event) => updateProfile('defaultPaymentTerms', event.target.value)} /></label>
          <label className="budget-field wide"><span>Observações</span><textarea value={profile.commercialNotes} onChange={(event) => updateProfile('commercialNotes', event.target.value)} /></label>
        </div>
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <button className="ghost-action" type="button" onClick={saveProfile}>Salvar Alterações</button>
        </div>
      </div>

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </div>
  );
}
