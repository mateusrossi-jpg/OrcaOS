import { generateUUID } from '../utils/idGenerator';
import { useState, useEffect } from 'react';

export interface TrustEvent {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
  timestamp: number;
  onUndo?: () => void;
  status: 'local' | 'syncing' | 'synced';
}

class TrustLayerManager {
  private events: TrustEvent[] = [];
  private listeners: Set<(events: TrustEvent[]) => void> = new Set();
  
  emit(event: Omit<TrustEvent, 'id' | 'timestamp'>) {
    const newEvent: TrustEvent = {
      ...event,
      id: generateUUID(),
      timestamp: Date.now()
    };
    this.events = [newEvent, ...this.events].slice(0, 50); // Keep last 50
    this.notify();
    return newEvent.id;
  }

  updateEventStatus(id: string, status: TrustEvent['status']) {
    this.events = this.events.map(e => e.id === id ? { ...e, status } : e);
    this.notify();
  }
  
  removeEvent(id: string) {
    this.events = this.events.filter(e => e.id !== id);
    this.notify();
  }

  getEvents() {
    return this.events;
  }

  subscribe(listener: (events: TrustEvent[]) => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach(l => l([...this.events]));
  }
}

export const trustLayer = new TrustLayerManager();

export function useTrustLayer() {
  const [events, setEvents] = useState<TrustEvent[]>(trustLayer.getEvents());
  // Force re-render to clear toast after 4s
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    return trustLayer.subscribe(setEvents);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);


  const activeToast = events.length > 0 && (now - events[0].timestamp < 4000) ? events[0] : null;

  return {
    events,
    recentEvents: events.filter(e => now - e.timestamp < 5 * 60 * 1000), // last 5 minutes
    activeToast
  };
}
