const FIRST_OPEN_INTRO_KEY = 'orcaos.hasSeenFirstOpenIntro.v1';
const LEGACY_FIRST_OPEN_INTRO_KEY = 'orcaos.hasSeenFirstOpenIntro';

export function hasSeenFirstOpenIntro(): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }
  try {
    return (
      window.localStorage.getItem(FIRST_OPEN_INTRO_KEY) === 'true' ||
      window.localStorage.getItem(LEGACY_FIRST_OPEN_INTRO_KEY) === 'true'
    );
  } catch {
    return false;
  }
}

export function markFirstOpenIntroSeen(): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(FIRST_OPEN_INTRO_KEY, 'true');
    window.localStorage.setItem(LEGACY_FIRST_OPEN_INTRO_KEY, 'true');
  } catch {
    // Local storage can be unavailable in restricted browser modes.
  }
}
