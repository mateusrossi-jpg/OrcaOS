import { useEffect, useState } from 'react';
import './AferixIntro.css';

export function AferixIntro() {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'hidden'>('visible');

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('aferix-intro-seen');
    if (hasSeen) {
      setPhase('hidden');
      return;
    }

    const fadeTimer = setTimeout(() => {
      setPhase('fading');
    }, 1900);

    const hideTimer = setTimeout(() => {
      setPhase('hidden');
      sessionStorage.setItem('aferix-intro-seen', 'true');
    }, 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div className={`aferix-intro ${phase}`} role="dialog" aria-modal="true">
      <div className="aferix-intro-glow" />
      <div className="aferix-intro-content">
        <div className="aferix-intro-logo-text">
          AFERI<span>X</span>
        </div>
        <h1 className="aferix-intro-phrase">
          Controle seu lucro com clareza.
        </h1>
        <p className="aferix-intro-sub">
          Gestão financeira para autônomos.
        </p>
        <div className="aferix-intro-loader" aria-hidden="true">
          <div className="aferix-intro-loader-bar" />
        </div>
      </div>
    </div>
  );
}
