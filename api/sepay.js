// ================================================================
// VERCEL SERVERLESS FUNCTION — SEPAY API V2 SECURE PROXY
// Kết nối trực tiếp tới SePay User API V2 chính thức
// SePay API Token được lưu an toàn trong Vercel Environment Variables
// ================================================================

import { sepayProxyLimiter } from './lib/rateLimit.js';
import { handleCors } from './lib/cors.js';

export default async function handler(req, res) {
  if (
    handleCors(req, res, {
      methods: 'GET,OPTIONS',
      allowedHeaders:
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    })
  ) {
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Chỉ chấp nhận phương thức GET' });
  }

  // ── Rate Limiting: 10 request / phút / IP ──
  const rateCheck = sepayProxyLimiter.check(req);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `Quá nhiều yêu cầu đồng bộ từ IP của bạn. Vui lòng thử lại sau ${rateCheck.retryAfter} giây.`,
      retryAfter: rateCheck.retryAfter,
    });
  }

  // ── SePay API Token: Đọc từ Vercel Environment Variable ──
  // Cấu hình: Vercel Dashboard → Settings → Environment Variables → SEPAY_API_TOKEN
  const sepayToken = process.env.SEPAY_API_TOKEN;
  if (!sepayToken) {
    return res.status(500).json({
      error: 'Chưa cấu hình SEPAY_API_TOKEN trên server.',
      hint: 'Vào Vercel Dashboard → Settings → Environment Variables → Thêm biến SEPAY_API_TOKEN với giá trị là API Token từ SePay.vn',
    });
  }

  const { account_number, limit = '50', per_page, bank_account_id } = req.query || {};
  const safeLimit = Math.min(Math.max(1, parseInt(per_page || limit, 10) || 50), 100);

  // Gọi tới SePay API V2 chính thức
  let targetUrl = `https://userapi.sepay.vn/v2/transactions?per_page=${safeLimit}`;
  if (account_number) {
    targetUrl += `&account_number=${encodeURIComponent(account_number)}`;
  }
  if (bank_account_id) {
    targetUrl += `&bank_account_id=${encodeURIComponent(bank_account_id)}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sepayToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await upstream.text();
    try {
      const data = JSON.parse(text);
      return res.status(upstream.status).json(data);
    } catch {
      return res.status(upstream.status).send(text);
    }
  } catch (error) {
    return res.status(502).json({
      error: 'Không thể kết nối máy chủ SePay',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
