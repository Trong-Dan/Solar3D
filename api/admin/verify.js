// ================================================================
// VERCEL SERVERLESS — ADMIN SESSION VERIFY
// Xác minh token HMAC-SHA256 do server cấp phát
// ================================================================

import { verifySessionToken, getSecurityConfig } from '../lib/crypto.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res, { methods: 'GET,OPTIONS' })) {
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Chỉ chấp nhận phương thức GET' });
  }

  const { sessionSecret } = getSecurityConfig();

  // Lấy token từ header Authorization: Bearer <token>
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ valid: false, reason: 'missing_token' });
  }

  const result = verifySessionToken(token, sessionSecret);

  if (result.valid) {
    return res.status(200).json({
      valid: true,
      expiresAt: result.payload.exp,
      role: result.payload.role,
    });
  }

  return res.status(401).json({
    valid: false,
    reason: result.reason,
  });
}
