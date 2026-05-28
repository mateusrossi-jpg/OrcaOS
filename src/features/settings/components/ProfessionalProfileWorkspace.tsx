import { useEffect, useState, type ChangeEvent } from 'react';
import { BackButton } from '../../../app/components/ui';
import { professionalProfileService } from '../../../services/professionalProfileService';
import { createDefaultProfessionalProfile, type ProfessionalProfile } from '../models/professionalProfile';
import './ProfessionalProfileWorkspace.css';

export function ProfessionalProfileWorkspace({ onBack }: { onBack?: () => void } = {}) {
  const [profile, setProfile] = useState<ProfessionalProfile>(() => createDefaultProfessionalProfile());

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      const loadedProfile = await professionalProfileService.getProfile();
      if (active) setProfile(loadedProfile);
    }
    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  function updateProfile<K extends keyof ProfessionalProfile>(key: K, value: ProfessionalProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function saveProfile() {
    const saved = await professionalProfileService.saveProfile(profile);
    setProfile(saved);
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

  async function regenerateIds() {
    const nextProfile = await professionalProfileService.regenerateIds(profile);
    setProfile(nextProfile);
  }

  return (
    <div className="professional-profile-workspace">
      {onBack && <BackButton label="Voltar para Configurações" onClick={onBack} />}

      <section className="professional-profile-header-card">
        <header>
          <div>
            <h2>Perfil Profissional</h2>
            <p>Dados usados em orçamentos e relatórios.</p>
          </div>
        </header>
      </section>

      <section className="professional-profile-section">
        <header>
          <div>
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

      <section className="professional-profile-section">
        <header>
          <div>
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

      <section className="professional-profile-section">
        <header>
          <div>
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
          <button className="ghost-action" type="button" onClick={() => void regenerateIds()}>Regenerar IDs</button>
        </div>
      </section>

      <section className="professional-profile-section">
        <header>
          <div>
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
          <button className="primary-action" type="button" onClick={() => void saveProfile()}>Salvar Alterações</button>
        </div>
      </section>
    </div>
  );
}
