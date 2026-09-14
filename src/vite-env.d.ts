/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_AFERIX_ENTITLEMENTS_ENDPOINT?: string;
  readonly VITE_AFERIX_ENTITLEMENTS_API_KEY?: string;
  readonly VITE_AFERIX_PRO_CHECKOUT_URL?: string;
  readonly VITE_AFERIX_PRO_MANAGE_URL?: string;
  readonly VITE_AFERIX_BILLING_CHANNEL?: string;
  readonly VITE_AFERIX_ANDROID_PACKAGE_NAME?: string;
  readonly VITE_AFERIX_PLAY_PRO_PRODUCT_ID?: string;
  readonly VITE_AFERIX_DEV_TOOLS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@capacitor/haptics' {
  export enum ImpactStyle {
    Light = 'LIGHT',
    Medium = 'MEDIUM',
    Heavy = 'HEAVY',
  }
  export enum NotificationType {
    Success = 'SUCCESS',
    Warning = 'WARNING',
    Error = 'ERROR',
  }
  export const Haptics: {
    impact(options: { style: ImpactStyle }): Promise<void>;
    notification(options: { type: NotificationType }): Promise<void>;
    vibrate(options?: { duration: number }): Promise<void>;
  };
}

declare module 'html2canvas' {
  export default function html2canvas(element: HTMLElement, options?: any): Promise<HTMLCanvasElement>;
}

declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: any);
    internal: {
      pageSize: {
        getWidth(): number;
        getHeight(): number;
      };
    };
    addImage(imageData: string | HTMLCanvasElement, format: string, x: number, y: number, width: number, height: number): void;
    output(type: 'blob'): Blob;
  }
}
