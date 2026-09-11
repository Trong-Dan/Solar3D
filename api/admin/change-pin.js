// ================================================================
// VERCEL SERVERLESS — ADMIN CHANGE PIN
// Đổi mã PIN bảo mật (xác minh PIN cũ trước khi đổi)
// Trả về hash mới để admin cập nhật Vercel Environment Variable
// ================================================================

import { verifyPin, hashPinPBKDF2, verifySessionToken, getSecurityConfig } from '../lib/crypto.js';
import { adminChangePinLimiter } from '../lib/rateLimit.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res, { methods: 'POST,OPTIONS' })) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Chỉ chấp nhận phương thức POST' });
  }

  const { pinSalt, pinHash, sessionSecret } = getSecurityConfig();

  // ── Xác minh session token ──
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const sessionResult = verifySessionToken(token, sessionSecret);

  if (!sessionResult.valid) {
    return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' });
  }

  // ── Rate limiting: 3 lần thử / 30 phút ──
  const rateCheck = adminChangePinLimiter.check(req);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `Quá nhiều lần thử đổi PIN. Vui lòng thử lại sau ${rateCheck.retryAfter} giây.`,
    });
  }

  // ── Parse body ──
  const { currentPin, newPin } = req.body || {};

  if (!currentPin || typeof currentPin !== 'string') {
    return res.status(400).json({ error: 'Vui lòng nhập mã PIN hiện tại.' });
  }

  if (!newPin || typeof newPin !== 'string' || newPin.trim().length < 4) {
    return res.status(400).json({ error: 'Mã PIN mới phải có ít nhất 4 ký tự.' });
  }

  if (newPin.trim().length > 32) {
    return res.status(400).json({ error: 'Mã PIN mới không được vượt quá 32 ký tự.' });
  }

  // ── Xác minh PIN cũ ──
  const isCurrentValid = verifyPin(currentPin.trim(), pinSalt, pinHash);
  if (!isCurrentValid) {
    return res.status(401).json({
      error: `Mã PIN hiện tại không đúng! Bạn còn ${rateCheck.remaining} lần thử.`,
    });
  }

  // ── Tạo hash cho PIN mới ──
  const newPinHash = hashPinPBKDF2(newPin.trim(), pinSalt);

  return res.status(200).json({
    success: true,
    message: '✅ Đã tạo hash cho mã PIN mới! Vui lòng cập nhật giá trị ADMIN_PIN_HASH trên Vercel Dashboard rồi Redeploy.',
    newPinHash,
    instructions: [
      '1. Mở Vercel Dashboard → Project → Settings → Environment Variables',
      '2. Tìm biến ADMIN_PIN_HASH và sửa giá trị thành hash mới bên dưới:',
      `3. Giá trị mới: ${newPinHash}`,
      '4. Bấm Save → Redeploy để áp dụng mã PIN mới',
    ],
  });
}
