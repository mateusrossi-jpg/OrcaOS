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

export function AppAccessGate({ children }: AppAccessGateProps) {
  const [isLocked, setIsLocked] = useState(() => isAppAccessLockEnabled() && !isAppAccessUnlocked());
  const [pin, setPin] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

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

  if (!isLocked) return children;

  return (
    <main className="app-access-gate">
      <form className="app-access-card" onSubmit={unlockApp}>
        <span className="orca-kicker">OrçaOS protegido</span>
        <h1>Desbloquear aplicativo</h1>
        <p>Digite o PIN configurado para acessar clientes, OS, orçamentos, catálogo e backups deste dispositivo.</p>
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
