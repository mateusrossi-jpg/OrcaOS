import { describe, expect, it } from 'vitest';
import { createWebhookSubscriptionPayload } from './subscription.js';

describe('subscription webhook payload', () => {
  it('normalizes approved payment into active Pro subscription', () => {
    const payload = createWebhookSubscriptionPayload({
      event: 'payment.approved',
      email: 'cliente@example.com',
      metadata: { userId: 'email:cliente@example.com' },
      current_period_end: '2026-06-03T00:00:00.000Z',
      provider: 'checkout',
      customerId: 'cus_123',
    });

    expect(payload).toEqual({
      email: 'cliente@example.com',
      userId: 'email:cliente@example.com',
      plan: 'pro',
      status: 'active',
      currentPeriodEnd: '2026-06-03T00:00:00.000Z',
      provider: 'checkout',
      providerCustomerId: 'cus_123',
    });
  });

  it('normalizes canceled event into free inactive subscription', () => {
    const payload = createWebhookSubscriptionPayload({
      event: 'subscription.canceled',
      customer: { email: 'cliente@example.com', id: 'cus_123' },
    });

    expect(payload.plan).toBe('free');
    expect(payload.status).toBe('canceled');
  });
});
