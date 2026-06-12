import { useState, lazy } from 'react';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import { accountPlanService } from '../../services/accountPlanService';
import { isGoogleAccountLoginConfigured, requestGoogleAccountProfile } from '../../core/access/googleAccountAuth';
import { planStatusTitle, planStatusDescription } from '../utils/planHelpers';
import { AferixTabs, PrimaryButton, SecondaryButton, Button, Input } from '../components/ui';
import { ScreenContainer, AppHeader, SurfaceCard, SectionLabel, Body, Subtitle } from '../../ui/system';

const AppSecurityPanel = lazy(() => import('../../features/settings/components/AppSecurityPanel').then((module) => ({ default: module.AppSecurityPanel })));
const GoogleDriveBackupPanel = lazy(() => import('../../features/settings/components/GoogleDriveBackupPanel').then((module) => ({ default: module.GoogleDriveBackupPanel })));
const LocalBackupWorkspace = lazy(() => import('../../features/settings/components/LocalBackupWorkspace').then((module) => ({ default: module.LocalBackupWorkspace })));
const ProfessionalProfileWorkspace = lazy(() => import('../../features/settings/components/ProfessionalProfileWorkspace').then((module) => ({ default: module.ProfessionalProfileWorkspace })));
const LegalCompliancePanel = lazy(() => import('../../features/settings/components/LegalCompliancePanel').then((module) => ({ default: module.LegalCompliancePanel })));

interface SettingsScreenProps {
  account: AferixAccountState;
  onAccountChange: (account: AferixAccountState) => void;
}

type SettingsTab = 'account' | 'company' | 'security' | 'backup' | 'about';

export function SettingsScreen({ account, onAccountChange: _onAccountChange }: SettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [emailDraft, setEmailDraft] = useState(account.email);
  const [nameDraft, setNameDraft] = useState(account.displayName === 'Visitante' ? '' : account.displayName);
  const googleReady = isGoogleAccountLoginConfigured();
  const accountLabel = account.status === 'google' || account.status === 'email' || account.status === 'local' ? account.displayName : 'Sem login';
  const accountDescription = account.status === 'google' ? `${account.email || 'E-mail não informado'} · Google vinculado` : account.status === 'email' ? `${account.email} · cadastro por e-mail` : account.status === 'local' ? 'Conta local deste dispositivo' : 'Modo visitante local-first';

  async function registerEmailAccount() {
    setIsSigningIn(true);
    try {
      await accountPlanService.signInEmailAccount(emailDraft, nameDraft);
      setFeedback('Conta por e-mail cadastrada.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao cadastrar e-mail.');
    } finally {
      setIsSigningIn(false);
    }
  }

  async function connectGoogle() {
    setIsSigningIn(true);
    setFeedback(null);
    try {
      const profile = await requestGoogleAccountProfile();
      await accountPlanService.signInGoogleAccount(profile);
      setFeedback('Conta Google conectada.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao entrar com Google.');
    } finally {
      setIsSigningIn(false);
    }
  }

  async function connectLocal() {
    setIsSigningIn(true);
    try {
      await accountPlanService.signInLocalAccount();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao entrar localmente.');
    } finally {
      setIsSigningIn(false);
    }
  }

  async function disconnectAccount() {
    setIsSigningIn(true);
    try {
      await accountPlanService.signOutLocalAccount();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao sair da conta.');
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <ScreenContainer className="pb-32">
      <AppHeader 
        title="Ajustes." 
      />

      <div className="flex flex-col gap-12 px-6 py-8">
        <AferixTabs
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as SettingsTab)}
          items={[
            { id: 'account', label: 'Conta' },
            { id: 'company', label: 'Empresa' },
            { id: 'security', label: 'Segurança' },
            { id: 'backup', label: 'Backup' },
            { id: 'about', label: 'Sobre' },
          ]}
        />

        <div className="settings-content-area flex flex-col gap-6 mt-2">
          {activeTab === 'account' && (
            <div className="flex flex-col gap-6">
              <SurfaceCard padding="lg">
                <SectionLabel className="mb-4">Sua Conta</SectionLabel>

                <div className="account-status-grid-compact mb-6">
                  <article className="settings-row-premium flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="row-content flex flex-col gap-0.5">
                      <strong className="text-[14px] text-white font-bold">{accountLabel}</strong>
                      <Subtitle className="text-[11px] text-[var(--text-secondary)]">{accountDescription}</Subtitle>
                      <Subtitle className="text-[10px] text-[var(--text-muted)]">{planStatusDescription(account, account.planSource === 'subscription' ? 'verificação Pro' : 'verificação local')}</Subtitle>
                    </div>
                    <div className="row-status">
                      <span className="plan-badge text-[10px] font-black tracking-widest font-mono text-[var(--accent-gold)] uppercase border border-[var(--accent-gold)]/20 bg-[var(--accent-gold)]/5 px-2 py-0.5 rounded">{planStatusTitle(account)}</span>
                    </div>
                  </article>
                </div>

                <section className="account-registration-card flex flex-col gap-6">
                  <div className="settings-form-grid flex flex-col gap-4">
                    <Input label="Nome profissional" value={nameDraft} placeholder="Ex.: Profissional técnico" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNameDraft(event.target.value)} />
                    <Input label="E-mail de acesso" type="email" value={emailDraft} placeholder="profissional@email.com" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmailDraft(event.target.value)} />
                  </div>
                  <div className="settings-actions-row-premium flex flex-col gap-2 mt-2">
                    <PrimaryButton disabled={isSigningIn} onClick={registerEmailAccount} className="h-12 w-full !text-[12px] font-black">Cadastrar e-mail</PrimaryButton>
                    <div className="grid grid-cols-3 gap-2">
                      <SecondaryButton disabled={!googleReady || isSigningIn} onClick={connectGoogle} className="h-10 text-[10px]">{isSigningIn ? 'Conectando...' : 'Vincular Google'}</SecondaryButton>
                      <Button variant="ghost" disabled={isSigningIn} onClick={connectLocal} className="h-10 text-[10px] hover:bg-white/5">Entrar localmente</Button>
                      <Button variant="ghost" disabled={isSigningIn} onClick={disconnectAccount} className="h-10 text-[10px] hover:bg-white/5 text-[var(--accent-red)]">Sair</Button>
                    </div>
                  </div>
                  {feedback && <Body className="text-[11px] font-mono text-[var(--accent-gold)] text-center mt-2 font-bold">{feedback}</Body>}
                </section>
              </SurfaceCard>

              <SurfaceCard padding="lg">
                <SectionLabel className="mb-4">Tema do Sistema</SectionLabel>
                <ThemeSelector />
              </SurfaceCard>
            </div>
          )}

          {activeTab === 'company' && <ProfessionalProfileWorkspace onBack={() => setActiveTab('account')} />}

          {activeTab === 'security' && <AppSecurityPanel />}

          {activeTab === 'backup' && (
            <div className="backup-settings-flow flex flex-col gap-4">
              <LocalBackupWorkspace includeLinkedSettings={false} />
              <GoogleDriveBackupPanel />
            </div>
          )}

          {activeTab === 'about' && (
            <div className="flex flex-col gap-4">
              <LegalCompliancePanel />
              <SurfaceCard padding="lg">
                <div className="settings-panel-title">
                  <SectionLabel className="mb-2">Sobre o Aferix</SectionLabel>
                  <Body className="text-[11px] text-[var(--text-muted)] font-mono uppercase tracking-wider">Versão Consolidada · Local-first Field OS</Body>
                </div>
              </SurfaceCard>
            </div>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}

function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('aferix-theme') || 'dark-premium';
  });

  const themes = [
    { id: 'dark-premium', label: 'Theme Dark Premium', desc: 'Fundo grafite/preto, contraste elegante (padrão).', colors: ['bg-[#121214]', 'bg-[#1C1C1E]', 'bg-[#FFD60A]'] },
    { id: 'light-professional', label: 'Theme Light Professional', desc: 'Interface clara e profissional de alto contraste.', colors: ['bg-[#FFFFFF]', 'bg-[#F2F2F7]', 'bg-[#C69B00]'] },
    { id: 'graphite-industrial', label: 'Theme Graphite Industrial', desc: 'Aparência de ferramenta profissional, grafite e aço industrial.', colors: ['bg-[#121214]', 'bg-[#252528]', 'bg-[#F59E0B]'] },
    { id: 'midnight-blue', label: 'Theme Midnight Blue', desc: 'Tons de azul escuro e corporativo.', colors: ['bg-[#050811]', 'bg-[#121A2E]', 'bg-[#FFD60A]'] },
    { id: 'high-contrast', label: 'Theme High Contrast', desc: 'Alto contraste para acessibilidade extrema.', colors: ['bg-[#000000]', 'bg-[#000000]', 'bg-[#FFFF00]'] },
  ];

  const handleSelect = (id: string) => {
    setCurrentTheme(id);
    localStorage.setItem('aferix-theme', id);
    document.documentElement.className = 'theme-' + id;
  };

  return (
    <div className="flex flex-col gap-3">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => handleSelect(t.id)}
          className={`w-full text-left p-4 rounded-[16px] border flex items-center justify-between cursor-pointer interactive-card ${
            currentTheme === t.id
              ? 'bg-surface-secondary border-accent-primary shadow-md'
              : 'bg-surface-primary border-border-primary'
          }`}
        >
          <div className="flex flex-col gap-0.5 max-w-[70%]">
            <span className={`text-[14px] font-bold ${currentTheme === t.id ? 'text-accent-primary' : 'text-white'}`}>
              {t.label}
            </span>
            <span className="text-[11.5px] text-white/50 leading-tight">
              {t.desc}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex -space-x-1">
              <div className={`w-3.5 h-3.5 rounded-full border border-white/10 ${t.colors[0]}`} />
              <div className={`w-3.5 h-3.5 rounded-full border border-white/10 ${t.colors[1]}`} />
              <div className={`w-3.5 h-3.5 rounded-full border border-white/10 ${t.colors[2]}`} />
            </div>
            {currentTheme === t.id && (
              <span className="text-[10px] font-black uppercase text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded border border-accent-primary/20 ml-2">Ativo</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
