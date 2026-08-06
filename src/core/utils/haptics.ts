import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Utilitário seguro para acionar feedback tátil nativo via Capacitor Haptics.
 * Possui fallback gracioso para Web/Navegadores desktop que não suportam a API.
 */
export async function triggerHapticLight(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }
}

export async function triggerHapticMedium(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  }
}

export async function triggerHapticHeavy(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch {
    if ('vibrate' in navigator) {
      navigator.vibrate(40);
    }
  }
}

export async function triggerHapticSuccess(): Promise<void> {
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    if ('vibrate' in navigator) {
      navigator.vibrate([15, 30, 15]);
    }
  }
}

export async function triggerHapticWarning(): Promise<void> {
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 50, 30]);
    }
  }
}
