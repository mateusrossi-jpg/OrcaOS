import { OperationalFeedItem } from '../../domain/operationalFeedProjection';

/**
 * UnreadTracker Foundation
 * Derives "unread" state entirely from the projection timestamps without duplicating DB.
 * Persists ONLY a local high-water mark timestamp for the user session.
 */
export class UnreadTracker {
  private readonly storageKey = 'aferix_last_read_timestamp';
  private lastReadTimestamp: number;

  constructor() {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(this.storageKey) : null;
    this.lastReadTimestamp = stored ? parseInt(stored, 10) : Date.now();
  }

  public markAllAsRead(): void {
    this.lastReadTimestamp = Date.now();
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, this.lastReadTimestamp.toString());
    }
  }

  public isUnread(item: OperationalFeedItem): boolean {
    if (!item.unreadCapable) return false;
    const itemTime = new Date(item.timestamp).getTime();
    return itemTime > this.lastReadTimestamp;
  }

  public getUnreadCount(feed: readonly OperationalFeedItem[]): number {
    return feed.filter(item => this.isUnread(item)).length;
  }
}

export const unreadTracker = new UnreadTracker();
