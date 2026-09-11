// ================================================================
// VERCEL SERVERLESS — ADMIN LOGIN (PBKDF2 + HMAC Session)
// Xác thực PIN phía server, chống brute-force bằng rate limiting IP
// ================================================================

import { verifyPin, createSessionToken, getSecurityConfig } from '../lib/crypto.js';
import { adminLoginLimiter } from '../lib/rateLimit.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res, { methods: 'POST,OPTIONS' })) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Chỉ chấp nhận phương thức POST' });
  }

  // ── Kiểm tra cấu hình bảo mật ──
  const { pinSalt, pinHash, sessionSecret, isDefaultConfig } = getSecurityConfig();

  // ── Rate limiting: 5 lần thử sai → khóa 15 phút ──
  const rateCheck = adminLoginLimiter.check(req);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `Quá nhiều lần thử đăng nhập sai. Vui lòng thử lại sau ${rateCheck.retryAfter} giây.`,
      retryAfter: rateCheck.retryAfter,
      remainingAttempts: 0,
    });
  }

  // ── Parse body ──
  const { pin } = req.body || {};
  if (!pin || typeof pin !== 'string' || pin.trim().length < 4) {
    return res.status(400).json({
      error: 'Mã PIN không hợp lệ (tối thiểu 4 ký tự).',
      remainingAttempts: rateCheck.remaining,
    });
  }

  // ── Xác minh PIN bằng PBKDF2 (100,000 iterations) ──
  const isValid = verifyPin(pin.trim(), pinSalt, pinHash);

  if (!isValid) {
    return res.status(401).json({
      error: `Mã PIN bảo mật không chính xác! Bạn còn ${rateCheck.remaining} lần thử.`,
      remainingAttempts: rateCheck.remaining,
    });
  }

  // ── PIN đúng → Tạo session token ──
  const clientIP = adminLoginLimiter.getClientIP(req);
  const token = createSessionToken(sessionSecret, {
    role: 'admin',
    ip: clientIP,
  });

  return res.status(200).json({
    success: true,
    token,
    expiresIn: 2 * 60 * 60 * 1000, // 2 giờ (ms)
    isDefaultPin: isDefaultConfig,
    message: isDefaultConfig
      ? 'Đăng nhập thành công với mã PIN mặc định. Hãy cấu hình Environment Variables trên Vercel để bảo vệ an toàn!'
      : 'Đăng nhập thành công! Phiên làm việc có hiệu lực 2 giờ.',
  });
}
