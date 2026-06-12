import { db } from '../storage/dexieDatabase';
import { generateUUID } from '../core/utils/idGenerator';
import { operationalEventService } from './operationalEventService';

export interface ReputationSummary {
  reputationScore: number;
  happinessScore: number;
  totalReviews: number;
  totalReferrals: number;
  convertedReferrals: number;
  promotersCount: number;
  detractorsCount: number;
}

/**
 * ReputationEngine
 * RC10 Strategic Layer: Converts operational success into trust and growth.
 * Responsible for review generation, referral tracking, and reputation scoring.
 */
export class ReputationEngine {
  /**
   * triggerReputationWorkflow
   * Triggered after work order completion to initiate requests and update scores.
   */
  async triggerReputationWorkflow(workOrderId: string, clientId: string): Promise<void> {
    const wo = await db.workOrders.get(workOrderId);
    if (!wo) return;

    // 1. Create a pending review record
    await db.reviews.add({
      id: generateUUID(),
      companyId: wo.companyId,
      workspaceId: wo.workspaceId,
      clientId,
      workOrderId,
      rating: 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    // 2. Emit Reputation Event
    await operationalEventService.emitEvent({
      aggregateId: workOrderId,
      aggregateType: 'reputation',
      eventType: 'REPUTATION_WORKFLOW_STARTED',
      metadata: { clientId, workOrderId },
    });
  }

  /**
   * getGlobalReputationSummary
   * Aggregates trust metrics for the entire business.
   */
  async getGlobalReputationSummary(): Promise<ReputationSummary> {
    const [reviews, referrals] = await Promise.all([
      db.reviews.toArray(),
      db.referrals.toArray()
    ]);

    const completedReviews = reviews.filter(r => r.status === 'completed' && r.rating > 0);
    const avgRating = completedReviews.length > 0 
      ? completedReviews.reduce((acc, r) => acc + r.rating, 0) / completedReviews.length 
      : 5.0;

    const promoters = completedReviews.filter(r => r.rating >= 4).length;
    const detractors = completedReviews.filter(r => r.rating <= 2).length;

    const happinessScore = completedReviews.length > 0 
      ? Math.round((promoters / completedReviews.length) * 100)
      : 100;

    return {
      reputationScore: Math.round(avgRating * 20), // 0-100 scale
      happinessScore,
      totalReviews: reviews.length,
      totalReferrals: referrals.length,
      convertedReferrals: referrals.filter(r => r.status === 'converted').length,
      promotersCount: promoters,
      detractorsCount: detractors
    };
  }

  /**
   * registerReview
   * Records a customer review (text, voice, rating).
   */
  async registerReview(reviewId: string, rating: number, comment?: string): Promise<void> {
    const review = await db.reviews.get(reviewId);
    if (!review) return;

    await db.reviews.update(reviewId, {
      rating,
      comment,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    await operationalEventService.emitEvent({
      aggregateId: reviewId,
      aggregateType: 'reputation',
      eventType: 'REVIEW_RECEIVED',
      metadata: { clientId: review.clientId, rating },
      snapshot: { rating, comment }
    });

    // Update Client Reputation Metrics
    await this.updateClientReputationMetrics(review.clientId);
  }

  private async updateClientReputationMetrics(clientId: string): Promise<void> {
    const clientReviews = await db.reviews.where('clientId').equals(clientId).toArray();
    const completed = clientReviews.filter(r => r.status === 'completed');
    
    if (completed.length === 0) return;

    const score = Math.round((completed.reduce((acc, r) => acc + r.rating, 0) / completed.length) * 20);
    const happiness = Math.round((completed.filter(r => r.rating >= 4).length / completed.length) * 100);

    const existing = await db.reputationMetrics.where('clientId').equals(clientId).first();
    const metric = {
      id: existing?.id || generateUUID(),
      companyId: completed[0].companyId,
      workspaceId: completed[0].workspaceId,
      clientId,
      score,
      happiness,
      lastUpdated: new Date().toISOString()
    };

    await db.reputationMetrics.put(metric);
  }

  /**
   * addReferral
   * Tracks a new referral lead.
   */
  async addReferral(referrerId: string, name: string, phone: string): Promise<void> {
    const referrer = await db.clients.get(referrerId);
    if (!referrer) return;

    await db.referrals.add({
      id: generateUUID(),
      companyId: referrer.companyId,
      workspaceId: referrer.workspaceId,
      referrerId,
      name,
      phone,
      status: 'lead',
      createdAt: new Date().toISOString()
    });

    await operationalEventService.emitEvent({
      aggregateId: referrerId,
      aggregateType: 'growth',
      eventType: 'REFERRAL_GENERATED',
      metadata: { clientId: referrerId, referralName: name },
    });
  }
}

export const reputationEngine = new ReputationEngine();
