import React, { useEffect, useState, useCallback } from 'react';
import { ERPTokens } from './tokens';
import { realtimeTransport } from '../../core/realtime/transport';
import { TransportEnvelope } from '../../core/realtime/transportTypes';
import { unreadTracker } from '../../core/realtime/unreadTracker';
import { operationalFeedService } from '../../services/operationalFeedService';
import { OperationalFeedItem } from '../../domain/operationalFeedProjection';

export function ERPToast() {
  const [toast, setToast] = useState<TransportEnvelope | null>(null);

  useEffect(() => {
    const unsubscribe = realtimeTransport.subscribe((envelope) => {
      if (envelope.type === 'notification' && !envelope.isReplay) {
        setToast(envelope);
        setTimeout(() => setToast(null), 5000); // Auto-hide
      }
    });
    return () => unsubscribe();
  }, []);

  if (!toast) return null;

  const payload = toast.payload as OperationalFeedItem;

  return (
    <div className={`fixed bottom-4 right-4 z-50 animate-bounce`}>
      <div className={`bg-gray-900 border ${ERPTokens.colors.borderFocus} rounded-lg shadow-lg p-4 flex gap-3 max-w-sm`}>
        <div className={`w-2 h-2 rounded-full mt-1.5 ${payload.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`} />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-100">{payload.title}</span>
          <span className="text-xs text-gray-400 mt-1">{payload.description}</span>
        </div>
        <button onClick={() => setToast(null)} className="text-gray-500 hover:text-gray-300 ml-2">✕</button>
      </div>
    </div>
  );
}

export function ERPNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [feed, setFeed] = useState<readonly OperationalFeedItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchFeed = useCallback(async () => {
    try {
      const data = operationalFeedService.getFeed();
      setFeed(data);
      setUnreadCount(unreadTracker.getUnreadCount(data));
    } catch (err) {
      console.error('Error fetching feed for notifications', err);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    // In addition to initial load, we listen to the transport for real-time notification appends
    const unsubscribe = realtimeTransport.subscribe((envelope) => {
      if (envelope.type === 'notification' || envelope.type === 'sync_request') {
        fetchFeed();
      }
    });
    return () => unsubscribe();
  }, [fetchFeed]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      unreadTracker.markAllAsRead();
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={handleOpen}
        className="relative p-2 rounded-full bg-gray-900 border border-gray-800 hover:bg-gray-800 transition-colors focus:outline-none"
        aria-label="Notificações"
      >
        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full border border-gray-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 bg-gray-950 border ${ERPTokens.colors.borderLight} rounded-xl shadow-xl z-50 flex flex-col overflow-hidden`}>
          <div className="p-3 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-200">Alertas Operacionais</h3>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{feed.length} eventos</span>
          </div>
          <div className="max-h-96 overflow-y-auto p-2 custom-scrollbar flex flex-col gap-2">
            {feed.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">Nenhum evento registrado.</div>
            ) : (
              feed.map(item => (
                <div key={item.id} className="p-3 bg-gray-900/40 hover:bg-gray-800/60 rounded border border-gray-800/50 transition-colors flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-gray-200">{item.title}</span>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                      {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-tight">{item.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
