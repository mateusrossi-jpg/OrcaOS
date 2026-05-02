import { loadBusinessProfile } from '../../budgets/storage/businessProfileStorage';
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
  const businessProfile = loadBusinessProfile();
  const hasData = hasVisibleProfileData(profile) || Boolean(businessProfile.businessName || businessProfile.responsibleName || businessProfile.phone || businessProfile.email);
  const displayName = profile.businessName || businessProfile.businessName || profile.professionalName || businessProfile.responsibleName || 'Perfil profissional não configurado';
  const responsibleName = profile.professionalName && displayName !== profile.professionalName ? profile.professionalName : businessProfile.responsibleName && displayName !== businessProfile.responsibleName ? businessProfile.responsibleName : '';
  const location = [profile.address || businessProfile.address, [profile.city, profile.state].filter(Boolean).join(' / ')].filter(Boolean).join(' - ');
  const document = profile.document || businessProfile.documentNumber;
  const phone = profile.phone || businessProfile.phone;
  const email = profile.email || businessProfile.email;

  return (
    <aside className={compact ? 'professional-identity-card compact' : 'professional-identity-card'}>
      <div className="professional-identity-main">
        <span className="app-icon tone-green">ID</span>
        <div>
          <span className="orca-kicker">{contextLabel}</span>
          <strong>{displayName}</strong>
          {responsibleName && <small>Responsável: {responsibleName}</small>}
          {!hasData && <small>Configure seus dados em Configurações para aparecerem em propostas e relatórios.</small>}
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
