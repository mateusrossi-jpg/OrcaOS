import { useEffect, useState } from 'react';
import { professionalProfileService } from '../../../services/professionalProfileService';
import { createDefaultProfessionalProfile, type ProfessionalProfile } from '../models/professionalProfile';
import './ProfessionalIdentityCard.css';

interface ProfessionalIdentityCardProps {
  compact?: boolean;
  contextLabel?: string;
}

function hasVisibleProfileData(profile: ProfessionalProfile): boolean {
  return Boolean(profile.professionalName || profile.businessName || profile.document || profile.phone || profile.email || profile.city || profile.state);
}

export function ProfessionalIdentityCard({ compact = false, contextLabel = 'Identidade profissional' }: ProfessionalIdentityCardProps) {
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

  const hasData = hasVisibleProfileData(profile);
  const displayName = profile.businessName || profile.professionalName || 'Perfil profissional não configurado';
  const responsibleName = profile.professionalName && displayName !== profile.professionalName ? profile.professionalName : '';
  const location = [profile.address, [profile.city, profile.state].filter(Boolean).join(' / ')].filter(Boolean).join(' - ');
  const document = profile.document;
  const phone = profile.phone;
  const email = profile.email;

  return (
    <aside className={compact ? 'professional-identity-card compact' : 'professional-identity-card'}>
      {!compact && contextLabel && (
        <header className="mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] opacity-60">{contextLabel}</span>
        </header>
      )}
      <div className="professional-identity-main">
        <span className="app-icon tone-blue">ID</span>
        <div>
          <strong>{displayName}</strong>
          {responsibleName && <small>Responsável: {responsibleName}</small>}
          {!hasData && <small>Configure seus dados em Configurações para aparecerem em orçamentos e relatórios.</small>}
        </div>
      </div>

      {hasData && (
        <div className="professional-identity-details">
          {document && <span>Doc.: {document}</span>}
          {phone && <span>WhatsApp: {phone}</span>}
          {email && <span>E-mail: {email}</span>}
          {location && <span>Local: {location}</span>}
          {profile.mainArea && <span>Área: {profile.mainArea}</span>}
        </div>
      )}

      {!compact && profile.commercialNotes && (
        <p>{profile.commercialNotes}</p>
      )}
    </aside>
  );
}
