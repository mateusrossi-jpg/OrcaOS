export interface DeviceHealth {
  memoryUsagePercentage?: number;
  memoryLimitBytes?: number;
  storageUsageBytes: number;
  storageQuotaBytes: number;
  storagePercentage: number;
  browserVersion: string;
  userAgent: string;
  lastCrashDetected?: string;
  isOnline: boolean;
  logicalProcessors: number;
  device_id: string;
  crash_count: number;
  last_crash_at: string | null;
  bootstrap_records_per_second: number;
  sync_bytes_downloaded: number;
  dexie_size_mb: number;
  memory_peak_mb: number;
  transaction_duration_ms: number;
  ui_block_time_ms: number;
}

export class DeviceHealthService {
  private _lastCrashTimestamp: string | null = null;
  private _state = {
    ui_block_time_ms: 0
  };

  constructor() {
    this.setupCrashDetection();
  }

  private setupCrashDetection() {
    const lastSessionStatus = sessionStorage.getItem('aferix_session_status');
    if (lastSessionStatus === 'running') {
      this._lastCrashTimestamp = new Date().toISOString();
    }
    sessionStorage.setItem('aferix_session_status', 'running');

    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('aferix_session_status', 'closed_cleanly');
    });
  }

  public init() {
    this.setupCrashDetection();
    this.setupLongTaskObserver();
  }

  private setupLongTaskObserver() {
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
           if (entry.duration > 50) {
             this._state.ui_block_time_ms += entry.duration;

             // Assuming telemetryService exists globally or is imported
             (window as any).telemetryService?.track('memory_pressure', `perf_${Date.now()}`, {
                reason: 'long_task',
                duration: entry.duration,
                name: entry.name
             });
           }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('[DeviceHealth] LongTask observer not supported');
    }
  }

  async getHealth(): Promise<DeviceHealth> {
    const health: Partial<DeviceHealth> = {
      browserVersion: this.getBrowserVersion(),
      userAgent: navigator.userAgent,
      isOnline: navigator.onLine,
      logicalProcessors: navigator.hardwareConcurrency || 1,
      lastCrashDetected: this._lastCrashTimestamp || undefined,
      device_id: '',
      crash_count: 0,
      last_crash_at: null,
      bootstrap_records_per_second: 0,
      sync_bytes_downloaded: 0,
      dexie_size_mb: 0,
      memory_peak_mb: 0,
      transaction_duration_ms: 0,
      ui_block_time_ms: this._state.ui_block_time_ms
    };

    const mem = (performance as any).memory;
    if (mem) {
      health.memoryUsagePercentage = (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100;
      health.memoryLimitBytes = mem.jsHeapSizeLimit;
    }

    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      health.storageUsageBytes = estimate.usage || 0;
      health.storageQuotaBytes = estimate.quota || 1;
      health.storagePercentage = (health.storageUsageBytes / health.storageQuotaBytes) * 100;
    } else {
      health.storageUsageBytes = 0;
      health.storageQuotaBytes = 1;
      health.storagePercentage = 0;
    }

    return health as DeviceHealth;
  }

  private getBrowserVersion(): string {
    const ua = navigator.userAgent;
    let match = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(match[1])) {
      const tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return 'IE ' + (tem[1] || '');
    }
    if (match[1] === 'Chrome') {
      const tem = ua.match(/\bOPR|Edge\/(\d+)/);
      if (tem != null) return 'Opera/Edge ' + tem[1];
    }
    match = match[2] ? [match[1], match[2]] : [navigator.appName, navigator.appVersion, '-?'];
    const tem = ua.match(/version\/(\d+)/i);
    if (tem != null) match.splice(1, 1, tem[1]);
    return match.join(' ');
  }
}

export const deviceHealthService = new DeviceHealthService();
