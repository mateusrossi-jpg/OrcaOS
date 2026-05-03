import { useEffect, useState } from 'react';
import {
  APP_ACCESS_LOCK_CHANGED_EVENT,
  disableAppAccessLock,
  enableAppAccessLock,
  isAppAccessLockEnabled,
  lockCurrentSession,
} from '../storage/appAccessLock';

export function AppSecurityPanel() {
  const [isEnabled, setIsEnabled] = useState(() => isAppAccessLockEnabled());
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    function syncState() {
      setIsEnabled(isAppAccessLockEnabled());
    }
    window.addEventListener(APP_ACCESS_LOCK_CHANGED_EVENT, syncState);
    window.addEventListener('storage', syncState);
    return () => {
      window.removeEventListener(APP_ACCESS_LOCK_CHANGED_EVENT, syncState);
      window.removeEventListener('storage', syncState);
    };
  }, []);

  async function savePin() {
    if (pin !== confirmPin) {
      setFeedback('Os PINs não conferem.');
      return;
    }

    try {
      await enableAppAccessLock(pin);
      setPin('');
      setConfirmPin('');
      setIsEnabled(true);
      setFeedback('Bloqueio de acesso ativado.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível ativar o bloqueio.');
    }
  }

  function disableLock() {
    disableAppAccessLock();
    setIsEnabled(false);
    setFeedback('Bloqueio de acesso desativado.');
  }

  function lockNow() {
    lockCurrentSession();
  }

  return (
    <section className="local-backup-workspace app-security-panel">
      <div className="local-backup-header">
        <div>
          <span className="orca-kicker">Segurança</span>
          <h2>Bloqueio de acesso</h2>
          <p>Proteja o app neste dispositivo com um PIN antes de abrir dados de clientes, OS e orçamentos.</p>
        </div>
        <strong>{isEnabled ? 'Ativo' : 'Opcional'}</strong>
      </div>

      <div className="local-backup-grid">
        <article className="local-backup-card app-security-card">
          <div className="local-card-heading">
            <strong>{isEnabled ? 'Alterar PIN' : 'Ativar PIN'}</strong>
            <small>Proteção local contra acesso casual neste navegador. Conta e criptografia forte entram na fase de backend.</small>
          </div>
          <label className="local-backup-file">
            <span>Novo PIN</span>
            <input inputMode="numeric" type="password" value={pin} onChange={(event) => setPin(event.target.value)} />
          </label>
          <label className="local-backup-file">
            <span>Confirmar PIN</span>
            <input inputMode="numeric" type="password" value={confirmPin} onChange={(event) => setConfirmPin(event.target.value)} />
          </label>
          <div className="local-backup-actions">
            <button className="primary-action inline-action" type="button" onClick={savePin}>{isEnabled ? 'Salvar novo PIN' : 'Ativar bloqueio'}</button>
          </div>
        </article>

        <article className="local-backup-card app-security-card">
          <div className="local-card-heading">
            <strong>Sessão atual</strong>
            <small>Bloqueie o app ao emprestar o aparelho ou ao terminar um atendimento em campo.</small>
          </div>
          <div className="local-backup-actions">
            <button className="secondary-action inline-action" disabled={!isEnabled} type="button" onClick={lockNow}>Bloquear agora</button>
            <button className="danger-action" disabled={!isEnabled} type="button" onClick={disableLock}>Desativar bloqueio</button>
          </div>
        </article>
      </div>

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
