/* eslint-disable @typescript-eslint/no-explicit-any */
import { aferixLogger } from '../debug/aferixLogger';

const TAB_ID = Math.random().toString(36).substring(2, 10);
const BROADCAST_CHANNEL_NAME = 'aferix_tab_sync';

let bc: BroadcastChannel | null = null;
let isPrimaryTab = true; // Assume primary until proven otherwise
let heartbeatInterval: any;

export const multiTabProtection = {
  init: () => {
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      
      bc.onmessage = (event) => {
        if (event.data.type === 'HEARTBEAT' && event.data.tabId !== TAB_ID) {
          // Another tab exists!
          if (event.data.isPrimary && isPrimaryTab) {
            // Collision resolution - tie breaker
            if (event.data.tabId > TAB_ID) {
              isPrimaryTab = false;
              aferixLogger.warn('MultiTab', 'Demoted to secondary tab. Read-only recommended.');
            }
          }
        }
      };

      // Broadcast our existence
      bc.postMessage({ type: 'HEARTBEAT', tabId: TAB_ID, isPrimary: isPrimaryTab });
      
      heartbeatInterval = setInterval(() => {
        if (bc) bc.postMessage({ type: 'HEARTBEAT', tabId: TAB_ID, isPrimary: isPrimaryTab });
      }, 5000);
      
      aferixLogger.info('MultiTab', `Tab protection initialized. ID: ${TAB_ID}`);
    }
  },

  isPrimary: () => isPrimaryTab,

  destroy: () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (bc) bc.close();
  }
};
