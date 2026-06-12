import { openWhatsApp } from './mobility';

export type WhatsAppTemplateType = 'FOLLOW_UP' | 'COLLECTION' | 'RENEWAL' | 'REACTIVATION';

/**
 * WhatsApp Commercial Bridge (RC11)
 * Enforces human-first commercial communication with pre-filled templates.
 */
export const whatsappCommercialBridge = {
  open: (type: WhatsAppTemplateType, phone: string, data: { name: string, title?: string, value?: number }) => {
    const templates: Record<WhatsAppTemplateType, string> = {
      FOLLOW_UP: `Olá ${data.name}. Tudo bem? Gostaria de saber se conseguiu analisar a proposta "${data.title}" que enviamos.`,
      COLLECTION: `Olá ${data.name}. Identificamos um pagamento pendente referente ao serviço "${data.title}" executado recentemente. Poderia nos dar um retorno?`,
      RENEWAL: `Olá ${data.name}! Seu plano de manutenção "${data.title}" está próximo do vencimento. Posso encaminhar a proposta de renovação?`,
      REACTIVATION: `Olá ${data.name}. Já faz algum tempo desde nosso último atendimento. Gostaria de verificar se está tudo bem com seus equipamentos ou se podemos ajudar com algo.`
    };

    const message = templates[type] || '';
    openWhatsApp(phone, message);
  }
};
