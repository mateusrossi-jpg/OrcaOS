import { createContext, useContext } from 'react';

export type AttentionPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface AttentionConfig {
  priority: AttentionPriority;
}

export const AttentionContext = createContext<AttentionPriority>('P1');

export const useAttention = () => useContext(AttentionContext);
