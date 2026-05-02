import { useState, type ChangeEvent } from 'react';
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
          <span className="orca-kicker">Identidade da plataforma</span>
          <h2>Perfil profissional / empresa</h2>
          <p>Defina a identidade local que será vinculada a orçamentos, relatórios, OS, backup e futura sincronização.</p>
        </div>
        <strong>{profile.mainArea || 'Área não definida'}</strong>
      </div>

      <div className="professional-profile-card id-card">
        <div>
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
        <div>
          <strong>Dados principais</strong>
          <small>Esses dados também serão sincronizados com o cabeçalho da proposta/orçamento.</small>
        </div>
        <div className="professional-logo-editor">
          <div className="professional-logo-preview">
            {profile.logoDataUrl || profile.logoUrl ? <img src={profile.logoDataUrl || profile.logoUrl} alt="Logo profissional" /> : <span>Sem logo</span>}
          </div>
          <div>
            <strong>Logo dos documentos</strong>
            <small>Use uma imagem simples e horizontal sempre que possível. Ela aparece em orçamento e relatório.</small>
            <div className="professional-profile-actions">
              <label className="secondary-action inline-action file-action">Escolher logo<input accept="image/*" type="file" onChange={handleLogoFileChange} /></label>
              <button className="danger-action" type="button" onClick={removeLogo}>Remover logo</button>
            </div>
          </div>
        </div>
        <div className="professional-profile-grid">
          <label>
            <span>Nome profissional</span>
            <input value={profile.professionalName} placeholder="Ex.: Mateus Rossi" onChange={(event) => updateProfile('professionalName', event.target.value)} />
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
        <div>
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
          <label className="wide">
            <span>Condições padrão de pagamento</span>
            <textarea value={profile.defaultPaymentTerms} placeholder="Ex.: 50% na aprovação e 50% na entrega" onChange={(event) => updateProfile('defaultPaymentTerms', event.target.value)} />
          </label>
          <label className="wide">
            <span>Observações comerciais</span>
            <textarea value={profile.commercialNotes} placeholder="Ex.: atende residencial e comercial, preferência por obras de alto padrão, condições padrão de orçamento..." onChange={(event) => updateProfile('commercialNotes', event.target.value)} />
          </label>
        </div>
        <button className="primary-action inline-action" type="button" onClick={saveProfile}>Salvar e sincronizar perfil</button>
      </div>

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
