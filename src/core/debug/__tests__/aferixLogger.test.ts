import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aferixLogger } from '../aferixLogger';

describe('aferixLogger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats info log with prefix', () => {
    aferixLogger.info('Aferix Server', 'Server started on port 8080');
    expect(console.info).toHaveBeenCalledWith('[Aferix Server] Server started on port 8080');
  });

  it('formats warn log with prefix', () => {
    aferixLogger.warn('Session', 'Terminating stale session');
    expect(console.warn).toHaveBeenCalledWith('[Session] Terminating stale session');
  });

  it('formats error log with prefix and metadata', () => {
    const errorObj = new Error('Connection reset');
    aferixLogger.error('Cloud Ingestion', 'Fan-out failed', errorObj);
    expect(console.error).toHaveBeenCalledWith('[Cloud Ingestion] Fan-out failed', errorObj);
  });

  it('formats audit log with audit prefix', () => {
    aferixLogger.audit('Database', 'Completed full sweep');
    expect(console.log).toHaveBeenCalledWith('[Database Audit] Completed full sweep');
  });
});
