import { useEffect, useState } from 'react';
import './AferixIntro.css';

/**
 * AferixIntro: Cinematic startup splash screen.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export function AferixIntro() {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'hidden'>('visible');

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('aferix-intro-seen');
    if (hasSeen) {
      setPhase('hidden');
      return;
    }

    // Lock scroll while intro is visible
    document.body.style.overflow = 'hidden';

    const fadeTimer = setTimeout(() => {
      setPhase('fading');
    }, 1900);

    const hideTimer = setTimeout(() => {
      setPhase('hidden');
      document.body.style.overflow = '';
      sessionStorage.setItem('aferix-intro-seen', 'true');
    }, 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      document.body.style.overflow = '';
    };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div className={`aferix-intro-screen ${phase}`} role="dialog" aria-modal="true">
      <div className="intro-content">
        <div className="intro-logo-container">
          <img className="intro-wordmark" src="/icons/aferix-splash-mark.svg" alt="Aferix Wordmark" />
        </div>
        
        <h1 className="intro-title">
          Controle seu lucro com clareza
        </h1>
        
        <p className="intro-subtitle">
          Gestão financeira para autônomos
        </p>
        
        <div className="intro-loading-track" aria-hidden="true">
          <div className="intro-loading-bar" />
        </div>
      </div>
    </div>
  );
}
