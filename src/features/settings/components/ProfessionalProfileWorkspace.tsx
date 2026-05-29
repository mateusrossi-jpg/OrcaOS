import { useEffect, useState, type ChangeEvent } from 'react';
import { 
  PageTitle, 
  PageShell, 
  Card, 
  SectionLabel, 
  Input, 
  TextArea, 
  PrimaryButton, 
  Button
} from '../../../app/components/ui';
import { professionalProfileService } from '../../../services/professionalProfileService';
import { createDefaultProfessionalProfile, type ProfessionalProfile } from '../models/professionalProfile';
import { ChevronLeft } from 'lucide-react';
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
    <PageShell>
      {onBack && (
        <button 
          onClick={onBack} 
          className="flex items-center gap-1.5 text-[13px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-8"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar para Configurações
        </button>
      )}

      <PageTitle 
        eyebrow="Configurações" 
        title="Perfil Profissional" 
        subtitle="Dados usados em orçamentos e relatórios técnicos."
      />

      <div className="flex flex-col gap-8 pb-32">
        <Card className="p-8">
          <SectionLabel className="mt-0 mb-6">Logo da empresa</SectionLabel>
          <div className="flex flex-col items-center gap-6">
            <div className="h-32 w-32 rounded-3xl bg-[var(--bg-surface-elevated)] border var(--border-soft) flex items-center justify-center overflow-hidden shadow-soft">
              {profile.logoDataUrl || profile.logoUrl ? (
                <img src={profile.logoDataUrl || profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">MARCA</span>
              )}
            </div>
            <div className="flex gap-3">
              <label className="min-h-[48px] rounded-[var(--radius-button)] px-6 text-[13.5px] font-bold transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2.5 bg-[var(--bg-surface-glass)] border var(--border-soft) text-[var(--text-primary)] hover:bg-white/[0.07] cursor-pointer">
                Upload Logo
                <input accept="image/*" type="file" onChange={handleLogoFileChange} className="hidden" />
              </label>
              {(profile.logoDataUrl || profile.logoUrl) && (
                <Button variant="danger" onClick={removeLogo}>Remover</Button>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <SectionLabel className="mt-0 mb-6">Dados da Empresa</SectionLabel>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nome Profissional" value={profile.professionalName} onChange={e => updateProfile('professionalName', e.target.value)} />
              <Input label="Nome Empresa" value={profile.businessName} onChange={e => updateProfile('businessName', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Documento (CPF/CNPJ)" value={profile.document} onChange={e => updateProfile('document', e.target.value)} />
              <Input label="WhatsApp" value={profile.phone} onChange={e => updateProfile('phone', e.target.value)} />
            </div>
            <Input label="Endereço Completo" value={profile.address} onChange={e => updateProfile('address', e.target.value)} />
          </div>
        </Card>

        <Card className="p-8">
          <SectionLabel className="mt-0 mb-6">Identificadores Locais</SectionLabel>
          <p className="text-[13.5px] text-[var(--text-muted)] mb-6 leading-relaxed">IDs únicos para sincronização de dados entre dispositivos.</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white/[0.02] border var(--border-subtle)">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] block mb-2">ID Profissional</span>
              <code className="text-[11px] text-[var(--text-secondary)] break-all">{profile.professionalId}</code>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border var(--border-subtle)">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] block mb-2">ID Empresa</span>
              <code className="text-[11px] text-[var(--text-secondary)] break-all">{profile.companyId}</code>
            </div>
          </div>
          <Button variant="ghost" className="w-full" onClick={() => void regenerateIds()}>Regenerar IDs</Button>
        </Card>

        <Card className="p-8">
          <SectionLabel className="mt-0 mb-6">Padrões de Orçamentos</SectionLabel>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Validade Padrão" value={profile.defaultValidity} onChange={e => updateProfile('defaultValidity', e.target.value)} />
              <Input label="Garantia Padrão" value={profile.defaultGuarantee} onChange={e => updateProfile('defaultGuarantee', e.target.value)} />
            </div>
            <TextArea label="Condições de Pagamento" value={profile.defaultPaymentTerms} onChange={e => updateProfile('defaultPaymentTerms', e.target.value)} rows={2} />
            <TextArea label="Observações Comerciais" value={profile.commercialNotes} onChange={e => updateProfile('commercialNotes', e.target.value)} rows={2} />
          </div>
        </Card>

        <PrimaryButton onClick={() => void saveProfile()}>Salvar Alterações</PrimaryButton>
      </div>
    </PageShell>
  );
}
