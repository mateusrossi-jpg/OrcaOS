function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function splitList(value) {
  return String(value || '')
    .split(',')
    .map((item) => normalize(item))
    .filter(Boolean);
}

function supabaseConfig(env = process.env) {
  const url = String(env.ORCAOS_SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = String(env.ORCAOS_SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return { url, serviceKey, configured: Boolean(url && serviceKey) };
}

function supabaseHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };
}

function isActiveRow(row, now = new Date()) {
  const status = normalize(row?.status);
  const plan = normalize(row?.plan);
  const periodEnd = row?.current_period_end ? new Date(row.current_period_end) : null;
  const isCurrent = !periodEnd || (!Number.isNaN(periodEnd.getTime()) && periodEnd >= now);
  return plan === 'pro' && ['active', 'trial'].includes(status) && isCurrent;
}

function rowToEntitlement(row) {
  const isPro = isActiveRow(row);
  const rawStatus = normalize(row?.status) || 'inactive';
  const periodEnd = row?.current_period_end ? new Date(row.current_period_end) : null;
  const isExpired = Boolean(periodEnd && !Number.isNaN(periodEnd.getTime()) && periodEnd < new Date());
  return {
    plan: isPro ? 'pro' : 'free',
    planSource: isPro ? 'subscription' : 'free',
    status: isPro ? rawStatus : isExpired ? 'expired' : rawStatus,
    expiresAt: row?.current_period_end || null,
  };
}

function allowlistEntitlement(payload, env = process.env) {
  const userId = normalize(payload?.userId);
  const email = normalize(payload?.email);
  const proUsers = new Set(splitList(env.ORCAOS_PRO_USERS));
  const isPro = Boolean((userId && proUsers.has(userId)) || (email && proUsers.has(email)));

  return {
    plan: isPro ? 'pro' : 'free',
    planSource: isPro ? 'subscription' : 'free',
    status: isPro ? 'active' : 'inactive',
    expiresAt: null,
  };
}

async function fetchSupabaseRows(payload, env = process.env) {
  const { url, serviceKey, configured } = supabaseConfig(env);
  if (!configured) return [];

  const filters = [];
  const userId = normalize(payload?.userId);
  const email = normalize(payload?.email);
  if (userId) filters.push(`user_id=eq.${encodeURIComponent(userId)}`);
  if (email) filters.push(`email=eq.${encodeURIComponent(email)}`);
  if (filters.length === 0) return [];

  const select = 'select=user_id,email,plan,status,current_period_end,provider,updated_at';
  const requests = filters.map(async (filter) => {
    const response = await fetch(`${url}/rest/v1/orcaos_subscriptions?${select}&${filter}&order=updated_at.desc&limit=1`, {
      headers: supabaseHeaders(serviceKey),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Erro ao consultar assinaturas: ${response.status}`);
    }
    return response.json();
  });

  return (await Promise.all(requests)).flat();
}

export async function resolveEntitlement(payload, env = process.env) {
  const rows = await fetchSupabaseRows(payload, env);
  const activeRow = rows.find((row) => isActiveRow(row));
  if (activeRow) return rowToEntitlement(activeRow);
  if (rows.length > 0) return rowToEntitlement(rows[0]);
  return allowlistEntitlement(payload, env);
}

export function createEntitlement(payload, env = process.env) {
  return allowlistEntitlement(payload, env);
}

export function isSupabaseSubscriptionStoreConfigured(env = process.env) {
  return supabaseConfig(env).configured;
}

export async function upsertSubscription(input, env = process.env) {
  const { url, serviceKey, configured } = supabaseConfig(env);
  if (!configured) throw new Error('Configure ORCAOS_SUPABASE_URL e ORCAOS_SUPABASE_SERVICE_ROLE_KEY.');

  const email = normalize(input?.email);
  if (!email || !email.includes('@')) throw new Error('Informe um e-mail válido.');

  const payload = {
    email,
    user_id: normalize(input?.userId) || null,
    plan: input?.plan === 'pro' ? 'pro' : 'free',
    status: ['active', 'trial', 'past_due', 'canceled', 'inactive'].includes(normalize(input?.status))
      ? normalize(input.status)
      : 'active',
    current_period_end: input?.currentPeriodEnd || null,
    provider: input?.provider || 'manual',
    provider_customer_id: input?.providerCustomerId || null,
    updated_at: new Date().toISOString(),
  };

  const response = await fetch(`${url}/rest/v1/orcaos_subscriptions?on_conflict=email`, {
    method: 'POST',
    headers: {
      ...supabaseHeaders(serviceKey),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erro ao gravar assinatura: ${response.status}`);
  }

  const rows = await response.json();
  return rows[0] ?? payload;
}
