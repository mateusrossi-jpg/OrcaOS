import { useEffect, useState, type ReactNode } from 'react';
import {
  APP_ACCESS_LOCK_CHANGED_EVENT,
  isAppAccessLockEnabled,
  isAppAccessUnlocked,
  verifyAppAccessPin,
} from '../storage/appAccessLock';
import './AppAccessGate.css';

interface AppAccessGateProps {
  children: ReactNode;
}

const FIRST_OPEN_INTRO_KEY = 'orcaos.hasSeenFirstOpenIntro.v1';
const LEGACY_FIRST_OPEN_INTRO_KEY = 'orcaos.hasSeenFirstOpenIntro';
const FIRST_OPEN_INTRO_DURATION_MS = 1450;

export function AppAccessGate({ children }: AppAccessGateProps) {
  const [isStarting, setIsStarting] = useState(() => {
    try {
      return (
        window.localStorage.getItem(FIRST_OPEN_INTRO_KEY) !== 'true'
        && window.localStorage.getItem(LEGACY_FIRST_OPEN_INTRO_KEY) !== 'true'
      );
    } catch {
      return true;
    }
  });
  const [isLocked, setIsLocked] = useState(() => isAppAccessLockEnabled() && !isAppAccessUnlocked());
  const [pin, setPin] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isStarting) return undefined;
    const startupTimer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(FIRST_OPEN_INTRO_KEY, 'true');
        window.localStorage.setItem(LEGACY_FIRST_OPEN_INTRO_KEY, 'true');
      } catch {
        // Local storage can be unavailable in restricted browser modes.
      }
      setIsStarting(false);
    }, FIRST_OPEN_INTRO_DURATION_MS);
    return () => window.clearTimeout(startupTimer);
  }, [isStarting]);

  useEffect(() => {
    function syncLockState() {
      setIsLocked(isAppAccessLockEnabled() && !isAppAccessUnlocked());
    }

    window.addEventListener(APP_ACCESS_LOCK_CHANGED_EVENT, syncLockState);
    window.addEventListener('storage', syncLockState);
    return () => {
      window.removeEventListener(APP_ACCESS_LOCK_CHANGED_EVENT, syncLockState);
      window.removeEventListener('storage', syncLockState);
    };
  }, []);

  async function unlockApp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isValid = await verifyAppAccessPin(pin);
    if (!isValid) {
      setFeedback('PIN incorreto.');
      return;
    }
    setPin('');
    setFeedback(null);
    setIsLocked(false);
  }

  if (isStarting) {
    return (
      <main className="app-startup-splash" aria-label="Abrindo Aferix">
        <div className="app-startup-mark" aria-hidden="true">
          <img src="/icons/aferix-icon.svg" alt="" />
        </div>
        <div className="app-startup-copy">
          <strong>Aferix</strong>
        </div>
        <span className="app-startup-scan" aria-hidden="true" />
      </main>
    );
  }

  if (!isLocked) return children;

  return (
    <main className="app-access-gate">
      <form className="app-access-card" onSubmit={unlockApp}>
        <div className="app-access-brand">
          <img src="/icons/aferix-icon.svg" alt="" />
          <div>
            <span className="orca-kicker">Aferix protegido</span>
            <strong>Acesso local</strong>
          </div>
        </div>
        <h1>Desbloquear aplicativo</h1>
        <p>Digite o PIN configurado para acessar clientes, atendimentos, orçamentos, catálogo e backups deste dispositivo.</p>
        <label>
          <span>PIN de acesso</span>
          <input autoFocus inputMode="numeric" type="password" value={pin} onChange={(event) => setPin(event.target.value)} />
        </label>
        <button className="primary-action inline-action" type="submit">Entrar</button>
        {feedback && <small>{feedback}</small>}
      </form>
    </main>
  );
}
