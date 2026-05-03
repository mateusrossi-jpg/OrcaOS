import { LocalBackupWorkspace } from './LocalBackupWorkspace';
import { ProfessionalProfileWorkspace } from './ProfessionalProfileWorkspace';

export function SettingsWorkspace() {
  return (
    <>
      <div className="settings-group">
        <h2>Conta</h2>
        <article className="settings-row">
          <span className="app-icon tone-gray">PL</span>
          <span>
            <strong>Meu plano</strong>
            <small>Grátis · base inicial ativa</small>
          </span>
          <span className="chevron">›</span>
        </article>
        <article className="settings-row">
          <span className="app-icon tone-blue">RM</span>
          <span>
            <strong>Roadmap</strong>
            <small>OrçaOS, módulos profissionais, relatórios e OS</small>
          </span>
          <span className="chevron">›</span>
        </article>
      </div>

      <ProfessionalProfileWorkspace />
      <LocalBackupWorkspace />
    </>
  );
}
