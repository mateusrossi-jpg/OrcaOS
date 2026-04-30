import { loadProfessionalProfile } from '../storage/professionalProfileStorage';
import './ProfessionalIdentityCard.css';

interface ProfessionalIdentityCardProps {
  compact?: boolean;
  contextLabel?: string;
}

function hasVisibleProfileData(profile: ReturnType<typeof loadProfessionalProfile>): boolean {
  return Boolean(profile.professionalName || profile.businessName || profile.document || profile.phone || profile.email || profile.city || profile.state);
}

export function ProfessionalIdentityCard({ compact = false, contextLabel = 'Identidade profissional' }: ProfessionalIdentityCardProps) {
  const profile = loadProfessionalProfile();
  const hasData = hasVisibleProfileData(profile);
  const displayName = profile.businessName || profile.professionalName || 'Perfil profissional não configurado';
  const responsibleName = profile.professionalName && profile.businessName ? profile.professionalName : '';
  const location = [profile.city, profile.state].filter(Boolean).join(' / ');

  return (
    <aside className={compact ? 'professional-identity-card compact' : 'professional-identity-card'}>
      <div className="professional-identity-main">
        <span className="app-icon tone-green">◇</span>
        <div>
          <span className="orca-kicker">{contextLabel}</span>
          <strong>{displayName}</strong>
          {responsibleName && <small>Responsável: {responsibleName}</small>}
          {!hasData && <small>Configure seus dados em Configurações para aparecerem em propostas e relatórios.</small>}
        </div>
      </div>

      {hasData && (
        <div className="professional-identity-details">
          {profile.document && <span>Doc.: {profile.document}</span>}
          {profile.phone && <span>WhatsApp: {profile.phone}</span>}
          {profile.email && <span>E-mail: {profile.email}</span>}
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
