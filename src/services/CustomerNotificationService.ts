import { generateId } from '../app/components/ui';

export class CustomerNotificationService {
  static async notifyProposalGenerated(clientId: string, proposalId: string) {
    // Simulando o envio de WhatsApp via Z-API/Evolution
    console.log(`[WhatsApp] Link de Aprovação enviado para o cliente ${clientId}: https://portal.aferix.com/p/${proposalId}`);
    return true;
  }

  static async notifyAnomalyDetected(clientId: string, anomalyId: string, isCritical: boolean) {
    if (isCritical) {
      console.log(`[Push + WhatsApp] Alerta Crítico para o cliente ${clientId}: Anomalia detectada.`);
    } else {
      console.log(`[In-App Notification] Anomalia registrada.`);
    }
    return true;
  }

  static async notifyWarrantyExpiring(clientId: string, assetId: string) {
    console.log(`[Email] Aviso de garantia vencendo para ativo ${assetId} do cliente ${clientId}`);
    return true;
  }
}
