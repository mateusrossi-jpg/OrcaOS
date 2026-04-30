import { useState } from 'react';
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
  const address = [profile.city, profile.state].filter(Boolean).join(' / ');

  saveBusinessProfile({
    ...currentBusinessProfile,
    businessName: profile.businessName || profile.professionalName || currentBusinessProfile.businessName,
    documentNumber: profile.document || currentBusinessProfile.documentNumber,
    phone: profile.phone || currentBusinessProfile.phone,
    email: profile.email || currentBusinessProfile.email,
    address: address || currentBusinessProfile.address,
    responsibleName: profile.professionalName || currentBusinessProfile.responsibleName,
    defaultNotes: profile.commercialNotes || currentBusinessProfile.defaultNotes,
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
