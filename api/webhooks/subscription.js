import { upsertSubscription } from '../subscriptionStore.js';

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ORCAOS_ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8',
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, DEFAULT_HEADERS);
  res.end(JSON.stringify(payload));
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function isAuthorized(req, env = process.env) {
  const expectedKey = String(env.ORCAOS_WEBHOOK_API_KEY || '').trim();
  if (!expectedKey) return false;
  const authorization = String(req.headers.authorization || '');
  return authorization === `Bearer ${expectedKey}`;
}

function normalizeWebhookPayload(input) {
  const event = normalize(input?.event || input?.type || input?.status);
  const paidEvents = ['paid', 'approved', 'active', 'subscription.active', 'payment.approved'];
  const trialEvents = ['trial', 'trialing', 'subscription.trial'];
  const pastDueEvents = ['past_due', 'delayed', 'subscription.past_due'];
  const canceledEvents = ['canceled', 'cancelled', 'refunded', 'chargeback', 'subscription.canceled'];
  const rawStatus = normalize(input?.status);
  const status = paidEvents.includes(event) || rawStatus === 'active'
    ? 'active'
    : trialEvents.includes(event) || rawStatus === 'trial'
      ? 'trial'
      : pastDueEvents.includes(event) || rawStatus === 'past_due'
        ? 'past_due'
        : canceledEvents.includes(event) || rawStatus === 'canceled'
          ? 'canceled'
          : 'inactive';

  return {
    email: input?.email || input?.customer?.email || input?.payer?.email,
    userId: input?.userId || input?.metadata?.userId || input?.external_reference,
    plan: status === 'inactive' || status === 'canceled' ? 'free' : 'pro',
    status,
    currentPeriodEnd: input?.currentPeriodEnd || input?.current_period_end || input?.expiresAt || null,
    provider: input?.provider || 'webhook',
    providerCustomerId: input?.providerCustomerId || input?.customerId || input?.customer?.id || null,
  };
}

export function createWebhookSubscriptionPayload(input) {
  return normalizeWebhookPayload(input);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Use POST para receber eventos de assinatura.' });
    return;
  }

  if (!process.env.ORCAOS_WEBHOOK_API_KEY) {
    sendJson(res, 503, { error: 'Configure ORCAOS_WEBHOOK_API_KEY antes de ativar webhook comercial.' });
    return;
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, { error: 'Webhook não autorizado.' });
    return;
  }

  try {
    const subscription = await upsertSubscription(normalizeWebhookPayload(req.body));
    sendJson(res, 200, { ok: true, subscription });
  } catch (error) {
    sendJson(res, 400, { error: error?.message || 'Não foi possível processar webhook.' });
  }
}
