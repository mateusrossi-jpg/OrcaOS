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

function isAuthorized(req, env = process.env) {
  const expectedKey = String(env.ORCAOS_ADMIN_API_KEY || '').trim();
  if (!expectedKey) return false;
  const authorization = String(req.headers.authorization || '');
  return authorization === `Bearer ${expectedKey}`;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Use POST para criar ou atualizar assinatura.' });
    return;
  }

  if (!process.env.ORCAOS_ADMIN_API_KEY) {
    sendJson(res, 503, { error: 'Configure ORCAOS_ADMIN_API_KEY antes de liberar assinaturas.' });
    return;
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, { error: 'Chave administrativa inválida.' });
    return;
  }

  try {
    const subscription = await upsertSubscription(req.body);
    sendJson(res, 200, { ok: true, subscription });
  } catch (error) {
    sendJson(res, 400, { error: error?.message || 'Não foi possível salvar assinatura.' });
  }
}
