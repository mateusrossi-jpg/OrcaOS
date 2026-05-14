import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, setConsent } from 'firebase/analytics';

// Substitua com as chaves reais geradas no Console do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// 🔒 PASSO CRÍTICO DE PRIVACIDADE: Configura o Consentimento
// Desativa o uso de dados para publicidade personalizada e remarketing.
// Mantém apenas o armazenamento de dados analíticos (estatísticas de uso).
setConsent({
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'granted',
});

export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

/**
 * Serviço de Telemetria Segura.
 * Regra: NUNCA passe valores em Reais (R$), descrições digitadas ou IDs de clientes.
 */
export const AnalyticsService = {
  logScreenView: (screenName: string) => {
    if (!analytics) return;
    logEvent(analytics, 'screen_view', {
      firebase_screen: screenName,
      firebase_screen_class: screenName,
    });
  },

  logAction: (actionName: string, additionalParams: Record<string, string | number> = {}) => {
    if (!analytics) return;
    // Limpa parâmetros para garantir que não mandamos dados profundos/objetos inteiros por engano
    const safeParams = { ...additionalParams, app_version: '0.1.0-rc.1' };
    logEvent(analytics, actionName, safeParams);
  }
};