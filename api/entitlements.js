import { createEntitlement, resolveEntitlement } from './subscriptionStore.js';

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': process.env.AFERIX_ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8',
};

export { createEntitlement };

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, DEFAULT_HEADERS);
  res.end(JSON.stringify(payload));
}

function isAuthorized(req, env = process.env) {
  const expectedKey = String(env.AFERIX_ENTITLEMENTS_API_KEY || '').trim();
  if (!expectedKey) return true;
  const authorization = String(req.headers.authorization || '');
  return authorization === `Bearer ${expectedKey}`;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Use POST para verificar assinatura.' });
    return;
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, { error: 'Chave de verificação inválida.' });
    return;
  }

  try {
    sendJson(res, 200, await resolveEntitlement(req.body));
  } catch {
    sendJson(res, 400, { error: 'Não foi possível verificar assinatura.' });
  }
}
