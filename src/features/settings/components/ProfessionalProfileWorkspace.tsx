import { useState, type ChangeEvent } from 'react';
import { BackButton, TextArea, Button } from '../../../app/components/ui';
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

export function ProfessionalProfileWorkspace({ onBack }: { onBack?: () => void } = {}) {
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
    <div className="professional-profile-workspace">
      {onBack && <BackButton label="Voltar para Configurações" onClick={onBack} />}

      <section className="professional-profile-header-card">
        <header>
          <div>
            <span className="aferix-kicker">Perfil</span>
            <h2>Perfil Profissional</h2>
            <p>Dados usados em orçamentos e relatórios.</p>
          </div>
        </header>
      </section>

      {/* 1. Identidade visual */}
      <section className="professional-profile-section">
        <header>
          <div>
            <span className="aferix-kicker">Identidade</span>
            <h2>Logo da empresa</h2>
            <p>Aparece em orçamentos e relatórios.</p>
          </div>
        </header>
        <div className="professional-logo-editor">
          <div className="professional-logo-preview">
            {profile.logoDataUrl || profile.logoUrl ? <img src={profile.logoDataUrl || profile.logoUrl} alt="Logo" /> : <div className="logo-placeholder">MARCA</div>}
          </div>
          <div className="professional-logo-copy">
            <div className="professional-profile-actions">
              <label className="secondary-action file-action">Upload Logo<input accept="image/*" type="file" onChange={handleLogoFileChange} /></label>
              {(profile.logoDataUrl || profile.logoUrl) && <button className="ghost-action danger-action" type="button" onClick={removeLogo}>Remover</button>}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Dados Comerciais */}
      <section className="professional-profile-section">
        <header>
          <div>
            <span className="aferix-kicker">Comercial</span>
            <h2>Dados da Empresa</h2>
          </div>
        </header>
        <div className="professional-profile-grid">
          <label className="budget-field"><span>Nome Profissional</span><input value={profile.professionalName} onChange={e => updateProfile('professionalName', e.target.value)} /></label>
          <label className="budget-field"><span>Nome Empresa</span><input value={profile.businessName} onChange={e => updateProfile('businessName', e.target.value)} /></label>
          <label className="budget-field"><span>Documento</span><input value={profile.document} onChange={e => updateProfile('document', e.target.value)} /></label>
          <label className="budget-field"><span>WhatsApp</span><input value={profile.phone} onChange={e => updateProfile('phone', e.target.value)} /></label>
          <label className="budget-field wide"><span>Endereço Completo</span><input value={profile.address} onChange={e => updateProfile('address', e.target.value)} /></label>
        </div>
      </section>

      {/* 2.5 IDs de Sincronização */}
      <section className="professional-profile-section">
        <header>
          <div>
            <span className="aferix-kicker">Segurança</span>
            <h2>Identificadores Locais</h2>
            <p>IDs únicos para sincronização de dados entre dispositivos.</p>
          </div>
        </header>
        <div className="professional-profile-id-grid">
          <div className="professional-profile-id-card">
            <span>ID Profissional</span>
            <code>{profile.professionalId}</code>
          </div>
          <div className="professional-profile-id-card">
            <span>ID Empresa</span>
            <code>{profile.companyId}</code>
          </div>
        </div>
        <div className="professional-profile-actions">
          <button className="ghost-action" type="button" onClick={regenerateIds}>Regenerar IDs</button>
        </div>
      </section>

      {/* 3. Padrões de Orçamentos */}
      <section className="professional-profile-section">
        <header>
          <div>
            <span className="aferix-kicker">Documentos</span>
            <h2>Padrões de Orçamentos</h2>
          </div>
        </header>
        <div className="professional-profile-grid">
          <label className="budget-field"><span>Validade</span><input value={profile.defaultValidity} onChange={e => updateProfile('defaultValidity', e.target.value)} /></label>
          <label className="budget-field"><span>Garantia</span><input value={profile.defaultGuarantee} onChange={e => updateProfile('defaultGuarantee', e.target.value)} /></label>
          <label className="budget-field wide"><span>Condições de Pagamento</span><textarea value={profile.defaultPaymentTerms} onChange={e => updateProfile('defaultPaymentTerms', e.target.value)} /></label>
          <label className="budget-field wide"><span>Observações</span><textarea value={profile.commercialNotes} onChange={e => updateProfile('commercialNotes', e.target.value)} /></label>
        </div>
        <div className="professional-profile-save-row">
          <button className="primary-action" type="button" onClick={saveProfile}>Salvar Alterações</button>
        </div>
      </section>
    </div>
  );
}
