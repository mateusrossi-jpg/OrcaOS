import { LocalBackupWorkspace } from './LocalBackupWorkspace';
import { ProfessionalProfileWorkspace } from './ProfessionalProfileWorkspace';

export function SettingsWorkspace() {
  return (
    <div className="refined-settings-workspace" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header className="screen-header">
        <h1>Configurações e Perfil</h1>
      </header>

      <div className="aferix-panel-card">
        <header>
          <div>
            <h2>Assinatura e Conta</h2>
          </div>
        </header>
        <div className="continuous-list">
          <article className="continuous-list-item">
            <div className="client-col">
              <strong>Plano Atual</strong>
              <small>Grátis · Base local ativa</small>
            </div>
            <span className="chevron">›</span>
          </article>
          <article className="continuous-list-item">
            <div className="client-col">
              <strong>Roadmap</strong>
              <small>Futuros módulos e atualizações</small>
            </div>
            <span className="chevron">›</span>
          </article>
        </div>
      </div>

      <ProfessionalProfileWorkspace />
      <LocalBackupWorkspace />
    </div>
  );
}
