import { useEffect, useState, type ChangeEvent } from 'react';
import { professionalProfileService } from '../../../services/professionalProfileService';
import { createDefaultProfessionalProfile, type ProfessionalProfile } from '../models/professionalProfile';
import { GlassInput, GlassTextarea, GlassFormCard } from '../../../ui/system/GlassForms';
import { SurfaceCard } from '../../../ui/system/Cards';
import { SectionLabel, Subtitle } from '../../../ui/system/Typography';
import { Camera, Trash2, RefreshCw, Save, Building2, IdCard, FileText } from 'lucide-react';
import { cn } from '../../../utils/ui';

export function ProfessionalProfileWorkspace({ onBack, hideTitle }: { onBack?: () => void; hideTitle?: boolean } = {}) {
  const [profile, setProfile] = useState<ProfessionalProfile>(() => createDefaultProfessionalProfile());
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      const loadedProfile = await professionalProfileService.getProfile();
      if (active) setProfile(loadedProfile);
    }
    void loadProfile();
    return () => { active = false; };
  }, []);

  function updateProfile<K extends keyof ProfessionalProfile>(key: K, value: ProfessionalProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function saveProfile() {
    setIsSaving(true);
    try {
      const saved = await professionalProfileService.saveProfile(profile);
      setProfile(saved);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
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

  const hasLogo = !!(profile.logoDataUrl || profile.logoUrl);

  return (
    <div className="flex flex-col gap-6 pb-32">
      {/* LOGO CARD */}
      <SurfaceCard
        padding="lg"
        className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-[var(--accent-gold)]/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-gold)]/5 blur-[60px] rounded-full pointer-events-none" />
        <SectionLabel className="mb-6 opacity-40 uppercase tracking-[0.3em]">Logo da Empresa</SectionLabel>

        <div className="flex flex-col items-center gap-6">
          {/* Logo preview */}
          <div className={cn(
            "w-28 h-28 rounded-[28px] border flex items-center justify-center overflow-hidden transition-all duration-500",
            hasLogo
              ? "border-[var(--accent-gold)]/20 bg-[var(--accent-gold)]/5 shadow-[0_0_30px_rgba(212,169,74,0.1)]"
              : "border-white/[0.06] bg-white/[0.02]"
          )}>
            {hasLogo ? (
              <img src={profile.logoDataUrl || profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/20">
                <Building2 size={28} />
                <span className="text-[9px] font-black uppercase tracking-widest">Marca</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <label className="h-11 px-5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 hover:text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer active:scale-95 transition-all">
              <Camera size={14} />
              Upload Logo
              <input accept="image/*" type="file" onChange={handleLogoFileChange} className="hidden" />
            </label>
            {hasLogo && (
              <button
                onClick={removeLogo}
                className="h-11 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </SurfaceCard>

      {/* DADOS DA EMPRESA */}
      <SurfaceCard padding="lg" className="shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex items-center justify-center text-[#0A84FF]">
            <Building2 size={14} />
          </div>
          <SectionLabel className="!mb-0 opacity-50 uppercase tracking-[0.2em]">Dados da Empresa</SectionLabel>
        </div>
        <div className="flex flex-col gap-5">
          <GlassInput
            label="Nome Profissional"
            value={profile.professionalName}
            onChange={e => updateProfile('professionalName', e.target.value)}
          />
          <GlassInput
            label="Nome da Empresa"
            value={profile.businessName}
            onChange={e => updateProfile('businessName', e.target.value)}
          />
          <GlassInput
            label="Documento (CPF/CNPJ)"
            value={profile.document}
            onChange={e => updateProfile('document', e.target.value)}
          />
          <GlassInput
            label="WhatsApp / Telefone"
            value={profile.phone}
            onChange={e => updateProfile('phone', e.target.value)}
            type="tel"
          />
          <GlassInput
            label="Endereço Completo"
            value={profile.address}
            onChange={e => updateProfile('address', e.target.value)}
          />
        </div>
      </SurfaceCard>

      {/* PADRÕES DE ORÇAMENTOS */}
      <SurfaceCard padding="lg" className="shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center text-[var(--accent-gold)]">
            <FileText size={14} />
          </div>
          <SectionLabel className="!mb-0 opacity-50 uppercase tracking-[0.2em]">Padrões de Orçamentos</SectionLabel>
        </div>
        <div className="flex flex-col gap-5">
          <GlassInput
            label="Validade Padrão"
            value={profile.defaultValidity}
            onChange={e => updateProfile('defaultValidity', e.target.value)}
          />
          <GlassInput
            label="Garantia Padrão"
            value={profile.defaultGuarantee}
            onChange={e => updateProfile('defaultGuarantee', e.target.value)}
          />
          <GlassTextarea
            label="Condições de Pagamento"
            value={profile.defaultPaymentTerms}
            onChange={e => updateProfile('defaultPaymentTerms', e.target.value)}
            rows={2}
          />
          <GlassTextarea
            label="Observações Comerciais"
            value={profile.commercialNotes}
            onChange={e => updateProfile('commercialNotes', e.target.value)}
            rows={2}
          />
        </div>
      </SurfaceCard>

      {/* IDENTIFICADORES */}
      <SurfaceCard padding="lg" className="shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <IdCard size={14} />
          </div>
          <SectionLabel className="!mb-0 opacity-50 uppercase tracking-[0.2em]">Identificadores Locais</SectionLabel>
        </div>
        <Subtitle className="text-[12px] opacity-30 mb-5 leading-relaxed">
          IDs únicos para sincronização de dados entre dispositivos.
        </Subtitle>
        <div className="flex flex-col gap-3 mb-6">
          {[
            { label: 'ID Profissional', value: profile.professionalId },
            { label: 'ID Empresa', value: profile.companyId },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 block mb-1.5">{label}</span>
              <code className="text-[10px] text-white/40 break-all font-mono leading-relaxed">{value}</code>
            </div>
          ))}
        </div>
        <button
          onClick={() => void regenerateIds()}
          className="w-full h-11 bg-white/[0.03] border border-white/[0.07] text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <RefreshCw size={14} />
          Regenerar IDs
        </button>
      </SurfaceCard>

      {/* SAVE */}
      <button
        onClick={() => void saveProfile()}
        disabled={isSaving}
        className={cn(
          "w-full h-16 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl",
          saved
            ? "bg-[#47C46A] text-white shadow-[0_8px_32px_rgba(53,199,89,0.3)]"
            : "bg-[#D4AF37] text-black shadow-[0_8px_32px_rgba(212,169,74,0.25)] hover:brightness-110"
        )}
      >
        <Save size={18} />
        {isSaving ? "SALVANDO..." : saved ? "SALVO ✓" : "SALVAR ALTERAÇÕES"}
      </button>
    </div>
  );
}
